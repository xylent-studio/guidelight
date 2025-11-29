# Session 07: Add Pick to Board

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 2 - Boards Core |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 06 completed |
| **Output** | AddPickDialog, pick picker, board item creation |

---

## Pre-Session Checklist

- [ ] Session 06 completed successfully
- [ ] Drag-drop working on BoardCanvas
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/18_BOARDS_CANVAS_ADD_AND_EDIT_FLOW.md`
- [ ] Review existing picks API helpers

---

## Session Goals

1. Create `AddPickDialog.tsx` component
2. Implement pick picker with search/filters (ALL published picks)
3. Add "Add pick" button to board toolbar
4. Create board_item with attribution when pick is from another user
5. Implement remove pick from board

---

## Q1 Answer Implementation

**Per Justin:** Anyone can use anyone's picks for boards. When showing another user's pick, display attribution like "Justin's pick", "From Nate" - can be prominent (header) or subtle (footnote).

**Changes needed:**
1. Load ALL published picks in AddPickDialog (not just user's own)
2. Add `attribution_style` column to `board_items` table
3. Show attribution on CanvasPickCard when pick owner ≠ board owner

---

## Acceptance Criteria

- [ ] "Add pick" button opens AddPickDialog
- [ ] Dialog shows ALL published picks (not just user's own)
- [ ] Each pick shows budtender name who created it
- [ ] Can filter by budtender, category, rating
- [ ] Selecting a pick opens attribution style chooser (if not own pick)
- [ ] New board_item created with correct sort_index and attribution_style
- [ ] Can remove pick from board (delete board_item)
- [ ] Attribution displays correctly on CanvasPickCard
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 0: Add attribution_style to board_items table

First, add a migration to support attribution:

```sql
-- Migration: add_attribution_to_board_items

ALTER TABLE public.board_items 
ADD COLUMN attribution_style text;

-- Check constraint for valid values
ALTER TABLE public.board_items 
ADD CONSTRAINT board_items_attribution_style_check 
CHECK (attribution_style IS NULL OR attribution_style IN ('prominent', 'subtle'));

COMMENT ON COLUMN public.board_items.attribution_style IS 'How to show pick attribution when owner differs from board owner. null = no attribution, prominent = header, subtle = footnote.';
```

### Step 1: Create AddPickDialog with ALL picks

Create `src/components/boards/AddPickDialog.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Star, User } from 'lucide-react';
import { getPublishedPicks, Pick } from '@/lib/api/picks';
import { useAuth } from '@/contexts/AuthContext';

type AttributionStyle = 'prominent' | 'subtle' | null;

type AddPickDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectPick: (pick: Pick, attributionStyle: AttributionStyle) => void;
  excludePickIds?: string[];
  boardOwnerId: string;  // To determine if attribution is needed
};

export function AddPickDialog({ 
  open, 
  onClose, 
  onSelectPick, 
  excludePickIds = [],
  boardOwnerId,
}: AddPickDialogProps) {
  const { profile } = useAuth();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Attribution selection state
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [attributionStyle, setAttributionStyle] = useState<AttributionStyle>('subtle');

  useEffect(() => {
    if (open) {
      loadPicks();
      setSelectedPick(null);
      setAttributionStyle('subtle');
    }
  }, [open]);

  async function loadPicks() {
    setLoading(true);
    // Q1 ANSWER: Load ALL published picks, not just user's own
    const data = await getPublishedPicks(100);  // Higher limit for picker
    setPicks(data);
    setLoading(false);
  }

  const filteredPicks = picks
    .filter(p => !excludePickIds.includes(p.id))
    .filter(p => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        p.product_name.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower) ||
        p.budtenders?.name?.toLowerCase().includes(searchLower)
      );
    });

  const handlePickClick = (pick: Pick) => {
    const isOwnPick = pick.budtender_id === boardOwnerId;
    
    if (isOwnPick) {
      // Own pick - no attribution needed, add directly
      onSelectPick(pick, null);
      onClose();
    } else {
      // Someone else's pick - show attribution chooser
      setSelectedPick(pick);
    }
  };

  const handleConfirmAttribution = () => {
    if (selectedPick) {
      onSelectPick(selectedPick, attributionStyle);
      onClose();
    }
  };

  // If showing attribution chooser (for someone else's pick)
  if (selectedPick) {
    const budtenderName = selectedPick.budtenders?.name || 'Unknown';
    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add {budtenderName}'s pick</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              How would you like to credit {budtenderName}?
            </p>
            
            <RadioGroup 
              value={attributionStyle || 'subtle'} 
              onValueChange={(v) => setAttributionStyle(v as AttributionStyle)}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg mb-2">
                <RadioGroupItem value="prominent" id="prominent" />
                <Label htmlFor="prominent" className="flex-1 cursor-pointer">
                  <span className="font-medium">Prominent</span>
                  <p className="text-sm text-muted-foreground">
                    "{budtenderName}'s Pick" as a header
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="subtle" id="subtle" />
                <Label htmlFor="subtle" className="flex-1 cursor-pointer">
                  <span className="font-medium">Subtle</span>
                  <p className="text-sm text-muted-foreground">
                    "From {budtenderName}" as a footnote
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedPick(null)}>
              Back
            </Button>
            <Button onClick={handleConfirmAttribution}>
              Add to board
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main pick list view
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add pick to board</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search picks by name, brand, or budtender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Pick list - now shows ALL published picks */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
          {loading ? (
            <p className="text-muted-foreground text-center py-4">Loading picks...</p>
          ) : filteredPicks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {search ? 'No picks match your search' : 'No picks available'}
            </p>
          ) : (
            filteredPicks.map(pick => {
              const isOwnPick = pick.budtender_id === boardOwnerId;
              const budtenderName = pick.budtenders?.name;
              
              return (
                <button
                  key={pick.id}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  onClick={() => handlePickClick(pick)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{pick.product_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {pick.brand && <span>{pick.brand}</span>}
                        {budtenderName && !isOwnPick && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {budtenderName}
                          </span>
                        )}
                        {isOwnPick && (
                          <Badge variant="secondary" className="text-xs">Your pick</Badge>
                        )}
                      </div>
                    </div>
                    {pick.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-star-filled text-star-filled" />
                        <span className="text-sm">{pick.rating}</span>
                      </div>
                    )}
                  </div>
                  {pick.one_liner && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {pick.one_liner}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 2: Add API helpers for board items (with attribution)

Add to `src/lib/api/boards.ts`:

```typescript
type AttributionStyle = 'prominent' | 'subtle' | null;

/**
 * Add a pick to a board with optional attribution
 */
export async function addPickToBoard(
  boardId: string, 
  pickId: string,
  attributionStyle: AttributionStyle = null
): Promise<BoardItem | null> {
  // Use DB-side max to avoid race condition
  const { data, error } = await supabase
    .from('board_items')
    .insert({
      board_id: boardId,
      type: 'pick',
      pick_id: pickId,
      attribution_style: attributionStyle,
      sort_index: supabase.sql`COALESCE((SELECT MAX(sort_index) + 1 FROM board_items WHERE board_id = ${boardId}), 0)`,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding pick to board:', error);
    return null;
  }
  
  return data;
}

/**
 * Remove an item from a board
 */
export async function removeBoardItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('board_items')
    .delete()
    .eq('id', itemId);
  
  if (error) {
    console.error('Error removing board item:', error);
    return false;
  }
  
  return true;
}
```

### Step 3: Update BoardEditorView toolbar

```typescript
// Add to BoardEditorView.tsx
import { Plus } from 'lucide-react';
import { AddPickDialog } from '@/components/boards/AddPickDialog';
import { addPickToBoard } from '@/lib/api/boards';

// In component:
const [showAddPick, setShowAddPick] = useState(false);

const handleAddPick = async (pick: Pick) => {
  if (!boardId) return;
  
  const newItem = await addPickToBoard(boardId, pick.id);
  if (newItem) {
    setItems([...items, newItem]);
    setPicks([...picks, pick]);
  }
};

// In toolbar:
<Button onClick={() => setShowAddPick(true)}>
  <Plus size={18} className="mr-2" />
  Add pick
</Button>

// Dialog:
<AddPickDialog
  open={showAddPick}
  onClose={() => setShowAddPick(false)}
  onSelectPick={handleAddPick}
  excludePickIds={items.filter(i => i.pick_id).map(i => i.pick_id!)}
/>
```

### Step 4: Add remove button to CanvasPickCard

```typescript
// Add to CanvasPickCard.tsx
import { X } from 'lucide-react';

type CanvasPickCardProps = {
  // ... existing props
  onRemove?: () => void;
};

// In render, add remove button next to drag handle:
{isCanvas && onRemove && (
  <button
    className="absolute top-2 right-8 p-1 text-muted-foreground hover:text-destructive"
    onClick={(e) => {
      e.stopPropagation();
      onRemove();
    }}
  >
    <X size={16} />
  </button>
)}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/boards/AddPickDialog.tsx` | Create |
| `src/lib/api/boards.ts` | Add addPickToBoard, removeBoardItem |
| `src/views/BoardEditorView.tsx` | Add toolbar button, dialog |
| `src/components/boards/CanvasPickCard.tsx` | Add remove button |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/18_BOARDS_CANVAS_ADD_AND_EDIT_FLOW.md` - Mark "Add existing pick" as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test adding picks to board
- [ ] Test removing picks from board
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove AddPickDialog component
2. Revert BoardEditorView changes
3. Remove API helper additions

---

## Next Session

→ **Session 08: Add Text Block + Board CRUD**

