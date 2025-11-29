# Session 04: Boards Home View

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 2 - Boards Core |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 03 completed |
| **Output** | BoardsHomeView, BoardCard, /boards route |

---

## Pre-Session Checklist

- [ ] Session 03 completed successfully
- [ ] Auto boards exist in database
- [ ] `src/lib/api/boards.ts` exists with `getBoards()`
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/07_UI_PATTERNS_AND_COMPONENTS.md` Section C

---

## Session Goals

1. Create `BoardsHomeView.tsx`
2. Create `BoardCard.tsx` component
3. Add `/boards` route to App.tsx
4. Display auto boards and custom boards

---

## Design Constraint

**Reuse existing design system:**
- BoardCard follows existing card patterns (rounded corners, shadows, padding from `GUIDELIGHT_DESIGN_SYSTEM.md`)
- Use shadcn/ui components (Card, Badge)
- Use Lucide icons for board type indicators
- Follow existing typography and color tokens

---

## Acceptance Criteria

- [ ] `/boards` route works and is protected
- [ ] BoardsHomeView shows all boards grouped by type
- [ ] BoardCard shows name, type icon, status badge, description
- [ ] Auto boards section shows auto_store and auto_user boards
- [ ] Custom boards section shows custom boards (may be empty)
- [ ] "New board" button visible (functionality in Session 08)
- [ ] Click on board card navigates to `/boards/:boardId` (placeholder for now)
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create BoardCard component

Create `src/components/boards/BoardCard.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, User, Star } from 'lucide-react';
import { Board } from '@/lib/api/boards';

type BoardCardProps = {
  board: Board;
  onClick?: () => void;
};

const typeIcons = {
  auto_store: Store,
  auto_user: User,
  custom: Star,
};

const typeLabels = {
  auto_store: 'Store',
  auto_user: 'Personal',
  custom: 'Custom',
};

export function BoardCard({ board, onClick }: BoardCardProps) {
  const Icon = typeIcons[board.type];
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {typeLabels[board.type]}
            </span>
          </div>
          <Badge variant={board.status === 'published' ? 'default' : 'secondary'}>
            {board.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <CardTitle className="text-lg">{board.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {board.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {board.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 2: Create BoardsHomeView

Create `src/views/BoardsHomeView.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { BoardCard } from '@/components/boards/BoardCard';
import { getBoards, Board } from '@/lib/api/boards';

export function BoardsHomeView() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBoards() {
      setLoading(true);
      const data = await getBoards();
      setBoards(data);
      setLoading(false);
    }
    loadBoards();
  }, []);

  const autoBoards = boards.filter(b => b.type === 'auto_store' || b.type === 'auto_user');
  const customBoards = boards.filter(b => b.type === 'custom');

  const handleBoardClick = (board: Board) => {
    navigate(`/boards/${board.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        title="Boards"
        rightContent={
          <Button onClick={() => {/* TODO: New board modal */}}>
            <Plus size={18} className="mr-2" />
            New board
          </Button>
        }
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <p className="text-muted-foreground">Loading boards...</p>
        ) : (
          <>
            {/* Auto Boards Section */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Auto Boards</h2>
              {autoBoards.length === 0 ? (
                <p className="text-muted-foreground">No auto boards found.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {autoBoards.map(board => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onClick={() => handleBoardClick(board)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Custom Boards Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Custom Boards</h2>
              {customBoards.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No custom boards yet</p>
                  <Button variant="outline" onClick={() => {/* TODO */}}>
                    <Plus size={18} className="mr-2" />
                    Create your first board
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {customBoards.map(board => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onClick={() => handleBoardClick(board)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
```

### Step 3: Add route to App.tsx

Add to `src/App.tsx`:

```typescript
import { BoardsHomeView } from './views/BoardsHomeView';

// In the router configuration:
<Route 
  path="/boards" 
  element={
    <ProtectedRoute>
      <BoardsHomeView />
    </ProtectedRoute>
  } 
/>
```

### Step 4: Add navigation link

Add "Boards" to the overflow menu in `MyPicksView.tsx` (or header navigation):

```typescript
{ label: 'Boards', onClick: () => navigate('/boards') },
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/boards/BoardCard.tsx` | Create |
| `src/views/BoardsHomeView.tsx` | Create |
| `src/App.tsx` | Add /boards route |
| `src/views/MyPicksView.tsx` | Add Boards to menu |

---

## Canonical Docs to Update

- [ ] `docs/ARCHITECTURE_OVERVIEW.md` - Add /boards route to Section 2.0
- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/04_USER_FLOWS_STAFF_AND_BOARDS.md` - Mark Boards home as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test navigation to /boards
- [ ] Verify board cards display correctly
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove route from App.tsx
2. Delete BoardsHomeView.tsx and BoardCard.tsx
3. Remove navigation link from MyPicksView

---

## Next Session

→ **Session 05: Board Canvas - Read Only**

