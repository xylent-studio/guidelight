# Session 09: Pick Drafts API

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 3 - Pick Drafts Layer |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 08 completed |
| **Output** | pick_drafts API, autosave hooks |

---

## Pre-Session Checklist

- [ ] Session 08 completed successfully
- [ ] `pick_drafts` table exists from Session 01
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/06_PERSISTENCE_AND_DRAFTS_BEHAVIOR.md`

---

## Session Goals

1. Create pick drafts API helpers
2. Create `useDraftAutosave` hook
3. Test draft CRUD operations

---

## Draft Semantics (from vNEXT docs)

- **New pick draft**: `pick_id = NULL`, user creates new content
- **Edit draft**: `pick_id = existing`, user editing existing pick
- **Unique constraint**: One draft per (user_id, pick_id) pair
- **Autosave**: Debounced save every 2s after changes
- **Publish**: Creates/updates pick, deletes draft

---

## Acceptance Criteria

- [ ] Can create new pick draft
- [ ] Can update existing draft
- [ ] Can get user's drafts
- [ ] Can delete draft
- [ ] Autosave hook works with debounce
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create drafts API helpers

Create `src/lib/api/drafts.ts`:

```typescript
import { supabase } from '../supabaseClient';

// CRITICAL FIX (Issue 6): Renamed to avoid collision with src/types/pickDraft.ts
// - PickDraftRow = database row from pick_drafts table
// - PickDraft (in types/pickDraft.ts) = form state object
export type PickDraftRow = {
  id: string;
  user_id: string;
  pick_id: string | null;
  data: Record<string, unknown>;  // Contains PickDraft form state as JSON
  created_at: string;
  updated_at: string;
};

/**
 * Get all drafts for the current user
 */
export async function getUserDrafts(): Promise<PickDraftRow[]> {
  const { data, error } = await supabase
    .from('pick_drafts')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching drafts:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a specific draft by ID
 */
export async function getDraftById(draftId: string): Promise<PickDraftRow | null> {
  const { data, error } = await supabase
    .from('pick_drafts')
    .select('*')
    .eq('id', draftId)
    .single();
  
  if (error) {
    console.error('Error fetching draft:', error);
    return null;
  }
  
  return data;
}

/**
 * Get draft for editing an existing pick
 */
export async function getDraftForPick(pickId: string): Promise<PickDraftRow | null> {
  const { data, error } = await supabase
    .from('pick_drafts')
    .select('*')
    .eq('pick_id', pickId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching draft for pick:', error);
    return null;
  }
  
  return data;
}

/**
 * Create or update a draft (upsert)
 */
export async function saveDraft(
  userId: string,
  data: Record<string, unknown>,
  pickId?: string,
  draftId?: string
): Promise<PickDraftRow | null> {
  if (draftId) {
    // Update existing draft
    const { data: updated, error } = await supabase
      .from('pick_drafts')
      .update({ 
        data, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', draftId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating draft:', error);
      return null;
    }
    
    return updated;
  }
  
  // Create new draft or upsert based on pick_id
  const { data: created, error } = await supabase
    .from('pick_drafts')
    .upsert(
      {
        user_id: userId,
        pick_id: pickId || null,
        data,
      },
      {
        onConflict: 'user_id,pick_id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();
  
  if (error) {
    console.error('Error saving draft:', error);
    return null;
  }
  
  return created;
}

/**
 * Delete a draft
 */
export async function deleteDraft(draftId: string): Promise<boolean> {
  const { error } = await supabase
    .from('pick_drafts')
    .delete()
    .eq('id', draftId);
  
  if (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
  
  return true;
}

/**
 * Delete draft by pick_id (used after publishing)
 */
export async function deleteDraftForPick(pickId: string): Promise<boolean> {
  const { error } = await supabase
    .from('pick_drafts')
    .delete()
    .eq('pick_id', pickId);
  
  if (error) {
    console.error('Error deleting draft for pick:', error);
    return false;
  }
  
  return true;
}
```

### Step 2: Create useDraftAutosave hook

Create `src/hooks/useDraftAutosave.ts`:

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { saveDraft, deleteDraft, PickDraftRow } from '@/lib/api/drafts';

type UseDraftAutosaveOptions = {
  userId: string;
  pickId?: string;  // If editing existing pick
  initialDraft?: PickDraftRow;
  debounceMs?: number;
};

type UseDraftAutosaveReturn = {
  draft: PickDraftRow | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  updateDraft: (data: Record<string, unknown>) => void;
  discardDraft: () => Promise<void>;
  isDirty: boolean;
};

export function useDraftAutosave({
  userId,
  pickId,
  initialDraft,
  debounceMs = 2000,
}: UseDraftAutosaveOptions): UseDraftAutosaveReturn {
  const [draft, setDraft] = useState<PickDraftRow | null>(initialDraft || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);
  
  const pendingDataRef = useRef<Record<string, unknown> | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async (data: Record<string, unknown>) => {
    const dataHash = JSON.stringify(data);
    if (dataHash === lastSavedDataRef.current) {
      return; // No changes since last save
    }
    
    setSaveStatus('saving');
    
    const saved = await saveDraft(userId, data, pickId, draft?.id);
    
    if (saved) {
      setDraft(saved);
      lastSavedDataRef.current = dataHash;
      setSaveStatus('saved');
      setIsDirty(false);
      
      // Reset to idle after 2s
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
    }
  }, [userId, pickId, draft?.id]);

  const updateDraft = useCallback((data: Record<string, unknown>) => {
    setIsDirty(true);
    pendingDataRef.current = data;
    
    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current) {
        performSave(pendingDataRef.current);
        pendingDataRef.current = null;
      }
    }, debounceMs);
  }, [debounceMs, performSave]);

  const discardDraft = useCallback(async () => {
    if (draft?.id) {
      await deleteDraft(draft.id);
    }
    setDraft(null);
    setIsDirty(false);
    lastSavedDataRef.current = '';
  }, [draft?.id]);

  return {
    draft,
    saveStatus,
    updateDraft,
    discardDraft,
    isDirty,
  };
}
```

### Step 3: Create save status indicator component

Create `src/components/picks/SaveStatusIndicator.tsx`:

```typescript
import { Loader2, Check, AlertCircle } from 'lucide-react';

type SaveStatusIndicatorProps = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
};

export function SaveStatusIndicator({ status, className = '' }: SaveStatusIndicatorProps) {
  if (status === 'idle') return null;
  
  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {status === 'saving' && (
        <>
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check size={14} className="text-green-500" />
          <span className="text-muted-foreground">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle size={14} className="text-destructive" />
          <span className="text-destructive">Error saving</span>
        </>
      )}
    </div>
  );
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/api/drafts.ts` | Create |
| `src/hooks/useDraftAutosave.ts` | Create |
| `src/components/picks/SaveStatusIndicator.tsx` | Create |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/06_PERSISTENCE_AND_DRAFTS_BEHAVIOR.md` - Mark drafts API as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test draft CRUD via API calls
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove new files (drafts.ts, useDraftAutosave.ts, SaveStatusIndicator.tsx)

---

## Next Session

→ **Session 10: PickFormModal Draft Refactor**

