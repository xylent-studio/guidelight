# Session 10: PickFormModal Draft Refactor

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 3 - Pick Drafts Layer |
| **Estimated Duration** | 3 hours |
| **Prerequisites** | Session 09 completed |
| **Output** | PickFormModal uses drafts, autosave, publish button |

---

## Pre-Session Checklist

- [ ] Session 09 completed successfully
- [ ] Drafts API working
- [ ] `useDraftAutosave` hook exists
- [ ] Read existing `PickFormModal.tsx`

---

## Session Goals

1. Refactor PickFormModal to use draft layer
2. Integrate autosave
3. Change "Save" to "Publish"
4. Add discard draft functionality
5. Add save status indicator

---

## Current vs New Flow

### Current Flow (Immediate Save)

1. Open modal (new or edit)
2. Fill form
3. Click Save → immediately writes to `picks` table
4. Modal closes

### New Flow (Draft → Publish)

1. Open modal (new or edit)
2. Check for existing draft or create new
3. Fill form → autosaves to `pick_drafts` every 2s
4. Click Publish → writes to `picks`, deletes draft
5. OR click Discard → deletes draft, modal closes

---

## Acceptance Criteria

- [ ] Opening modal creates/loads draft
- [ ] Form changes autosave to draft
- [ ] Save status indicator shows in modal
- [ ] "Publish" button publishes pick
- [ ] "Discard" button discards draft
- [ ] Modal warns about unsaved changes on close
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Update PickFormModal props

```typescript
import { PickDraftRow } from '@/lib/api/drafts';

// PickFormModal.tsx - updated props
type PickFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pick?: Pick | null;  // Existing pick to edit
  draft?: PickDraftRow | null;  // Existing draft if resuming (DB row)
  defaultCategoryId?: string;
  onPublished?: () => void;  // Called after successful publish
};
```

### Step 2: Integrate useDraftAutosave hook

```typescript
// In PickFormModal.tsx
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { deleteDraftForPick } from '@/lib/api/drafts';

export function PickFormModal({ isOpen, onClose, pick, draft: initialDraft, defaultCategoryId, onPublished }: PickFormModalProps) {
  const { profile } = useAuth();
  
  // Initialize form state from draft or pick
  const [formData, setFormData] = useState<PickDraft>(() => {
    if (initialDraft?.data) {
      return initialDraft.data as PickDraft;
    }
    if (pick) {
      return pickToFormData(pick);
    }
    return getDefaultFormData(defaultCategoryId);
  });

  // Hook up autosave
  const {
    draft,
    saveStatus,
    updateDraft,
    discardDraft,
    isDirty,
  } = useDraftAutosave({
    userId: profile!.id,
    pickId: pick?.id,
    initialDraft,
  });

  // Update draft on form changes
  useEffect(() => {
    if (isOpen) {
      updateDraft(formData as unknown as Record<string, unknown>);
    }
  }, [formData, isOpen, updateDraft]);

  // Handle close with unsaved changes
  const handleClose = () => {
    if (isDirty) {
      // Draft is autosaved, just close
      // Could show confirmation if needed
    }
    onClose();
  };

  // Publish pick
  const handlePublish = async () => {
    const pickData = formDataToPick(formData);
    
    if (pick) {
      // Update existing pick
      await updatePick(pick.id, pickData);
      await deleteDraftForPick(pick.id);
    } else {
      // Create new pick
      await createPick({
        ...pickData,
        budtender_id: profile!.id,
      });
      await discardDraft();
    }
    
    onPublished?.();
    onClose();
  };

  // Discard draft and close
  const handleDiscard = async () => {
    await discardDraft();
    onClose();
  };

  // ... rest of form rendering
}
```

### Step 3: Update modal footer

```typescript
// In PickFormModal render:
<DialogFooter className="flex items-center justify-between">
  <div className="flex items-center gap-4">
    <Button variant="ghost" onClick={handleDiscard}>
      Discard
    </Button>
    <SaveStatusIndicator status={saveStatus} />
  </div>
  <Button onClick={handlePublish}>
    Publish
  </Button>
</DialogFooter>
```

### Step 4: Handle close confirmation

```typescript
// Add before modal close
const handleCloseAttempt = () => {
  if (isDirty) {
    // Show confirmation or just inform user draft is saved
    // For now, drafts auto-save so just close
  }
  onClose();
};
```

### Step 5: Helper functions

```typescript
// Convert Pick to form data
function pickToFormData(pick: Pick): PickDraft {
  return {
    product_name: pick.product_name,
    brand: pick.brand || '',
    category_id: pick.category_id,
    one_liner: pick.one_liner || '',
    why_i_love_it: pick.why_i_love_it || '',
    rating: pick.rating,
    time_of_day: pick.time_of_day || '',
    effect_tags: pick.effect_tags || [],
    // ... all other fields
  };
}

// Convert form data to Pick insert/update
function formDataToPick(formData: PickDraft): Partial<Pick> {
  return {
    product_name: formData.product_name,
    brand: formData.brand || null,
    category_id: formData.category_id,
    one_liner: formData.one_liner || null,
    why_i_love_it: formData.why_i_love_it || null,
    rating: formData.rating,
    time_of_day: formData.time_of_day || null,
    effect_tags: formData.effect_tags.length > 0 ? formData.effect_tags : null,
    status: 'published',  // Published picks are always 'published' status
    is_active: true,
    // ... all other fields
  };
}

// Default form data for new pick
function getDefaultFormData(categoryId?: string): PickDraft {
  return {
    product_name: '',
    brand: '',
    category_id: categoryId || '',
    one_liner: '',
    why_i_love_it: '',
    rating: 8.5,
    time_of_day: 'Anytime',
    effect_tags: [],
    // ... all other fields with defaults
  };
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/picks/PickFormModal.tsx` | Major refactor |
| `src/types/pickDraft.ts` | Update if needed |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/06_PERSISTENCE_AND_DRAFTS_BEHAVIOR.md` - Mark PickFormModal drafts as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test new pick creation with draft autosave
- [ ] Test editing existing pick with draft
- [ ] Test publish and discard flows
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Revert PickFormModal.tsx to previous version
2. Drafts API remains usable for future session

---

## Next Session

→ **Session 11: My Picks Drafts Integration**

