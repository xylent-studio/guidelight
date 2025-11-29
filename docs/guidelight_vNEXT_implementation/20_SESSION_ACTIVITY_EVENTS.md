# Session 20: Activity Events (minimal)

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 7 - Releases & Activity |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 19 completed |
| **Output** | activity_events table, event logging, "Last updated by" snippets |

---

## Pre-Session Checklist

- [ ] Session 19 completed successfully
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/13_ACTIVITY_AND_AUDIT_LOG.md`

---

## Session Goals

1. Create `activity_events` table
2. Create activity logging helpers
3. Log events for key actions
4. Add "Last updated by" snippets to UI

---

## Scope (from CONFLICTS_AND_DECISIONS.md)

**In-scope (MVP):**
- activity_events table
- Event logging for: PICK_CREATED, PICK_UPDATED, PICK_ARCHIVED, BOARD_CREATED, BOARD_PUBLISHED, BOARD_UNPUBLISHED
- "Last updated by {name}" snippets on boards/picks

**Deferred:**
- Full Activity feed UI for managers
- Filtering/search in activity
- Export activity

---

## Acceptance Criteria

- [ ] `activity_events` table created
- [ ] Events logged on key actions
- [ ] Boards show "Last updated by {name}"
- [ ] Pick cards show "Last updated by {name}" (optional, time permitting)
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create activity_events table migration

```sql
-- Migration: create_activity_events_table

CREATE TYPE activity_event_type AS ENUM (
  'PICK_CREATED',
  'PICK_UPDATED',
  'PICK_ARCHIVED',
  'BOARD_CREATED',
  'BOARD_UPDATED',
  'BOARD_PUBLISHED',
  'BOARD_UNPUBLISHED'
);

CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES public.budtenders(id) ON DELETE CASCADE,
  event_type activity_event_type NOT NULL,
  entity_type text NOT NULL,  -- 'pick', 'board'
  entity_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}',
  
  -- Store user name snapshot for display
  user_name text NOT NULL
);

-- Indexes
CREATE INDEX activity_events_entity_idx ON public.activity_events(entity_type, entity_id);
CREATE INDEX activity_events_user_idx ON public.activity_events(user_id);
CREATE INDEX activity_events_created_idx ON public.activity_events(created_at DESC);

-- RLS
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Everyone can read activity
CREATE POLICY "activity_events_select_all" ON public.activity_events
  FOR SELECT TO authenticated USING (true);

-- Users can insert their own events
CREATE POLICY "activity_events_insert_own" ON public.activity_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));

COMMENT ON TABLE public.activity_events IS 'Audit log of significant actions.';
```

### Step 2: Create activity API helpers

Create `src/lib/api/activity.ts`:

```typescript
import { supabase } from '../supabaseClient';

export type ActivityEventType = 
  | 'PICK_CREATED'
  | 'PICK_UPDATED'
  | 'PICK_ARCHIVED'
  | 'BOARD_CREATED'
  | 'BOARD_UPDATED'
  | 'BOARD_PUBLISHED'
  | 'BOARD_UNPUBLISHED';

export type ActivityEvent = {
  id: string;
  created_at: string;
  user_id: string;
  event_type: ActivityEventType;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  user_name: string;
};

/**
 * Log an activity event
 */
export async function logActivity(
  userId: string,
  userName: string,
  eventType: ActivityEventType,
  entityType: 'pick' | 'board',
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('activity_events')
    .insert({
      user_id: userId,
      user_name: userName,
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata || {},
    });
  
  if (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Get latest activity for an entity
 */
export async function getLatestActivityForEntity(
  entityType: string,
  entityId: string
): Promise<ActivityEvent | null> {
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching activity:', error);
    return null;
  }
  
  return data;
}

/**
 * Get recent activity for user
 */
export async function getRecentActivityForUser(
  userId: string,
  limit: number = 20
): Promise<ActivityEvent[]> {
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
  
  return data || [];
}
```

### Step 3: Add logging to picks API

Update `src/lib/api/picks.ts`:

```typescript
import { logActivity } from './activity';

// In createPick:
export async function createPick(pick: Partial<Pick>, userId: string, userName: string): Promise<Pick | null> {
  const { data, error } = await supabase
    .from('picks')
    .insert(pick)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating pick:', error);
    return null;
  }
  
  // Log activity
  await logActivity(userId, userName, 'PICK_CREATED', 'pick', data.id, {
    product_name: pick.product_name,
  });
  
  return data;
}

// In updatePick:
export async function updatePick(pickId: string, updates: Partial<Pick>, userId: string, userName: string): Promise<Pick | null> {
  const { data, error } = await supabase
    .from('picks')
    .update(updates)
    .eq('id', pickId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating pick:', error);
    return null;
  }
  
  // Log activity
  await logActivity(userId, userName, 'PICK_UPDATED', 'pick', pickId);
  
  return data;
}
```

### Step 4: Add logging to boards API

Update `src/lib/api/boards.ts`:

```typescript
import { logActivity } from './activity';

// In createBoard:
// ... after insert ...
await logActivity(ownerId, ownerName, 'BOARD_CREATED', 'board', data.id, {
  board_name: name,
});

// In updateBoard when status changes:
if (updates.status === 'published') {
  await logActivity(userId, userName, 'BOARD_PUBLISHED', 'board', boardId);
} else if (updates.status === 'unpublished') {
  await logActivity(userId, userName, 'BOARD_UNPUBLISHED', 'board', boardId);
}
```

### Step 5: Create LastUpdatedBy component

Create `src/components/ui/LastUpdatedBy.tsx`:

```typescript
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { getLatestActivityForEntity, ActivityEvent } from '@/lib/api/activity';

type LastUpdatedByProps = {
  entityType: 'pick' | 'board';
  entityId: string;
  className?: string;
};

export function LastUpdatedBy({ entityType, entityId, className = '' }: LastUpdatedByProps) {
  const [activity, setActivity] = useState<ActivityEvent | null>(null);

  useEffect(() => {
    getLatestActivityForEntity(entityType, entityId).then(setActivity);
  }, [entityType, entityId]);

  if (!activity) return null;

  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      Last updated by {activity.user_name} {timeAgo}
    </p>
  );
}
```

### Step 6: Add LastUpdatedBy to BoardEditorView

```typescript
// In BoardEditorView.tsx header:
import { LastUpdatedBy } from '@/components/ui/LastUpdatedBy';

// In render:
{board && (
  <LastUpdatedBy entityType="board" entityId={board.id} className="mt-1" />
)}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/YYYYMMDD_create_activity_events_table.sql` | Create |
| `src/lib/api/activity.ts` | Create |
| `src/lib/api/picks.ts` | Add activity logging |
| `src/lib/api/boards.ts` | Add activity logging |
| `src/components/ui/LastUpdatedBy.tsx` | Create |
| `src/views/BoardEditorView.tsx` | Add LastUpdatedBy |

---

## Canonical Docs to Update

- [ ] `docs/ARCHITECTURE_OVERVIEW.md` - Add activity_events to data model
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/13_ACTIVITY_AND_AUDIT_LOG.md` - Mark as "Partial" (table + snippets, not full UI)

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test activity logging on pick create/update
- [ ] Test activity logging on board actions
- [ ] Test "Last updated by" displays correctly
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Drop activity_events table
2. Remove activity.ts
3. Revert picks/boards API changes
4. Remove LastUpdatedBy component

---

## vNEXT Implementation Complete!

After Session 20, the core vNEXT features are implemented:
- ✅ Boards (auto + custom)
- ✅ Pick drafts with autosave
- ✅ Product catalog (minimal)
- ✅ Display Mode with boards
- ✅ User preferences
- ✅ Releases + What's New
- ✅ Activity logging (minimal)

**Deferred for future work:**
- Full Activity feed UI
- Historical release timeline
- Product management UI
- Treez integration
- Board layout (position_x, position_y) for freeform canvas

