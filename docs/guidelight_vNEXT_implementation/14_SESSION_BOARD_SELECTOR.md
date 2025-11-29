# Session 14: Board Selector in Display

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 4 - Display Mode Enhancement |
| **Estimated Duration** | 2 hours |
| **Prerequisites** | Session 13 completed |
| **Output** | Board selector dropdown in Display Mode |

---

## Pre-Session Checklist

- [ ] Session 13 completed successfully
- [ ] Display Mode shows boards
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/08_NAVIGATION_AND_BOARD_SELECTION.md`

---

## Session Goals

1. Create BoardSelector component
2. Add board selection to Display Mode header
3. Remember selected board (later: via user_preferences)

---

## Design

**Board selector appears in Display Mode header:**
- Dropdown showing all published boards
- Grouped by type (Auto, Custom)
- Selected board highlighted
- Changes URL to `/display/:boardId`

---

## Acceptance Criteria

- [ ] Board selector dropdown in Display Mode header
- [ ] Shows all published boards grouped by type
- [ ] Selecting board navigates to /display/:boardId
- [ ] Current board shown as selected
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create BoardSelector component

Create `src/components/boards/BoardSelector.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store, User, Star } from 'lucide-react';
import { getBoards, Board } from '@/lib/api/boards';

type BoardSelectorProps = {
  currentBoardId?: string;
  onSelect?: (board: Board) => void;
};

export function BoardSelector({ currentBoardId, onSelect }: BoardSelectorProps) {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    async function loadBoards() {
      const allBoards = await getBoards();
      // Only show published boards in display mode
      const publishedBoards = allBoards.filter(b => b.status === 'published');
      setBoards(publishedBoards);
    }
    loadBoards();
  }, []);

  const autoBoards = boards.filter(b => b.type === 'auto_store' || b.type === 'auto_user');
  const customBoards = boards.filter(b => b.type === 'custom');

  const handleSelect = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (board) {
      onSelect?.(board);
      navigate(`/display/${boardId}`);
    }
  };

  return (
    <Select value={currentBoardId} onValueChange={handleSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select board" />
      </SelectTrigger>
      <SelectContent>
        {autoBoards.length > 0 && (
          <SelectGroup>
            <SelectLabel>Auto Boards</SelectLabel>
            {autoBoards.map(board => (
              <SelectItem key={board.id} value={board.id}>
                <div className="flex items-center gap-2">
                  {board.type === 'auto_store' ? (
                    <Store size={14} className="text-muted-foreground" />
                  ) : (
                    <User size={14} className="text-muted-foreground" />
                  )}
                  <span>{board.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {customBoards.length > 0 && (
          <SelectGroup>
            <SelectLabel>Custom Boards</SelectLabel>
            {customBoards.map(board => (
              <SelectItem key={board.id} value={board.id}>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-muted-foreground" />
                  <span>{board.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {boards.length === 0 && (
          <div className="py-2 px-4 text-sm text-muted-foreground">
            No boards available
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
```

### Step 2: Add to DisplayModeView header

```typescript
// In DisplayModeView.tsx header:
import { BoardSelector } from '@/components/boards/BoardSelector';

// In render:
<header className="border-b px-4 py-3 flex items-center justify-between">
  <div>
    <h1 className="text-xl font-semibold">{board?.name}</h1>
    {board?.description && (
      <p className="text-sm text-muted-foreground mt-1">{board.description}</p>
    )}
  </div>
  <BoardSelector currentBoardId={board?.id} />
</header>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/boards/BoardSelector.tsx` | Create |
| `src/views/DisplayModeView.tsx` | Add BoardSelector |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/08_NAVIGATION_AND_BOARD_SELECTION.md` - Mark board selector as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test board selector shows correct boards
- [ ] Test selecting board navigates correctly
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove BoardSelector component
2. Revert DisplayModeView header changes

---

## Next Session

→ **Session 15: Products Table + Import**

