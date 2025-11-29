# Session 11: My Picks Drafts Integration

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 3 - Pick Drafts Layer |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 10 completed |
| **Output** | Drafts section in MyPicksView, resume editing |

---

## Pre-Session Checklist

- [ ] Session 10 completed successfully
- [ ] PickFormModal uses drafts
- [ ] Drafts API has `getUserDrafts()`
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/07_UI_PATTERNS_AND_COMPONENTS.md` Section A

---

## Session Goals

1. Add Drafts section to MyPicksView
2. Create DraftCard component
3. Enable resuming draft editing
4. Enable deleting drafts from list

---

## Design

**Drafts appear in their own section at the top of My Picks:**

```
+---------------------------+
| My picks                  |
+---------------------------+
| [Drafts Section]          |
| - Draft 1 (new)           |
| - Draft 2 (editing X)     |
+---------------------------+
| [Category Chips]          |
+---------------------------+
| [Published Picks Grid]    |
+---------------------------+
```

---

## Acceptance Criteria

- [ ] Drafts section visible when user has drafts
- [ ] DraftCard shows product name, time since edit, status
- [ ] Click draft card opens PickFormModal with draft data
- [ ] Can delete draft from list
- [ ] Drafts section hidden when no drafts
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create DraftCard component

Create `src/components/picks/DraftCard.tsx`:

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock } from 'lucide-react';
import { PickDraftRow } from '@/lib/api/drafts';
import { formatDistanceToNow } from 'date-fns';

type DraftCardProps = {
  draft: PickDraftRow;
  onResume: () => void;
  onDelete: () => void;
};

export function DraftCard({ draft, onResume, onDelete }: DraftCardProps) {
  const draftData = draft.data as { product_name?: string; brand?: string };
  const productName = draftData.product_name || 'Untitled pick';
  const brand = draftData.brand;
  const isEditing = !!draft.pick_id;
  const timeAgo = formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true });

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Edit size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{productName}</span>
              {isEditing && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                  Editing
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {brand && <span className="truncate">{brand}</span>}
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeAgo}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" onClick={onResume}>
              Resume
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 2: Update MyPicksView with drafts section

```typescript
// In MyPicksView.tsx
import { getUserDrafts, deleteDraft, PickDraftRow } from '@/lib/api/drafts';
import { DraftCard } from '@/components/picks/DraftCard';

// Add state
const [drafts, setDrafts] = useState<PickDraftRow[]>([]);
const [resumingDraft, setResumingDraft] = useState<PickDraftRow | null>(null);

// Load drafts
useEffect(() => {
  async function loadDrafts() {
    const userDrafts = await getUserDrafts();
    setDrafts(userDrafts);
  }
  if (profile) {
    loadDrafts();
  }
}, [profile]);

// Handle resume draft
const handleResumeDraft = (draft: PickDraftRow) => {
  setResumingDraft(draft);
  setIsModalOpen(true);
};

// Handle delete draft
const handleDeleteDraft = async (draftId: string) => {
  await deleteDraft(draftId);
  setDrafts(drafts.filter(d => d.id !== draftId));
};

// Refresh drafts after modal closes
const handleModalClose = () => {
  setIsModalOpen(false);
  setResumingDraft(null);
  // Refresh drafts
  getUserDrafts().then(setDrafts);
};
```

### Step 3: Render drafts section

```typescript
// In MyPicksView render, before category chips:
{drafts.length > 0 && (
  <section className="mb-6">
    <h2 className="text-sm font-medium text-muted-foreground mb-2">
      Drafts
    </h2>
    <div className="space-y-2">
      {drafts.map(draft => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onResume={() => handleResumeDraft(draft)}
          onDelete={() => handleDeleteDraft(draft.id)}
        />
      ))}
    </div>
  </section>
)}
```

### Step 4: Pass draft to PickFormModal

```typescript
// Update PickFormModal usage:
<PickFormModal
  isOpen={isModalOpen}
  onClose={handleModalClose}
  pick={editingPick}
  draft={resumingDraft}
  defaultCategoryId={selectedCategory}
  onPublished={() => {
    loadPicks();
    getUserDrafts().then(setDrafts);
  }}
/>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/picks/DraftCard.tsx` | Create |
| `src/views/MyPicksView.tsx` | Add drafts section |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/07_UI_PATTERNS_AND_COMPONENTS.md` - Mark drafts UI as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test drafts display correctly
- [ ] Test resume editing draft
- [ ] Test delete draft
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove DraftCard component
2. Revert MyPicksView changes

---

## Next Session

→ **Session 12: Visible Fields System**

