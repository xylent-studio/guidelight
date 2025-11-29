import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { BoardCard } from '@/components/boards/BoardCard';
import { NewBoardDialog } from '@/components/boards/NewBoardDialog';
import { getBoards, createBoard } from '@/lib/api/boards';
import type { Board } from '@/lib/api/boards';
import { useAuth } from '@/contexts/AuthContext';

export function BoardsHomeView() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  // Session 08: New board dialog state
  const [showNewBoard, setShowNewBoard] = useState(false);

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

  // Session 08: Handle board creation
  const handleCreateBoard = async (name: string, description?: string) => {
    if (!profile?.id) return;
    
    const newBoard = await createBoard(name, profile.id, description);
    if (newBoard) {
      // Navigate to the new board
      navigate(`/boards/${newBoard.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        title="Boards"
        rightActions={
          <>
            <Button onClick={() => setShowNewBoard(true)}>
              <Plus size={18} className="mr-2" />
              New board
            </Button>
            <ProfileMenu />
          </>
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
                  <Button variant="outline" onClick={() => setShowNewBoard(true)}>
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
      
      {/* Session 08: New Board Dialog */}
      <NewBoardDialog
        open={showNewBoard}
        onClose={() => setShowNewBoard(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}

export default BoardsHomeView;

