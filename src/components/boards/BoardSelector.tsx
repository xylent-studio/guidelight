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
import { getBoards, type Board } from '@/lib/api/boards';

type BoardSelectorProps = {
  currentBoardId?: string;
  onSelect?: (board: Board) => void;
};

/**
 * Dropdown selector for choosing which board to display.
 * Used in Display Mode header to switch between boards.
 */
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

