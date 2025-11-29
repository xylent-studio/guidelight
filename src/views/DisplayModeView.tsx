import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GuestPickCard } from '@/components/picks/GuestPickCard';
import { BoardSelector } from '@/components/boards/BoardSelector';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getBoardById, 
  getBoardItems, 
  getAutoStoreBoard,
  type Board,
  type BoardItem,
} from '@/lib/api/boards';
import { 
  getPublishedPicks, 
  getPublishedPicksForBudtender,
  getVisiblePicksByIds,
} from '@/lib/api/picks';
import { getAssets } from '@/lib/api/assets';
import { getUserPreferences, updateLastBoard } from '@/lib/api/userPreferences';
import type { Database } from '@/types/database';

type Pick = Database['public']['Tables']['picks']['Row'];
type MediaAsset = Database['public']['Tables']['media_assets']['Row'];

/**
 * Display Mode - Public view for POS/kiosk
 * Now board-based:
 * - /display - shows auto_store board (house list)
 * - /display/:boardId - shows specific board
 * Works without authentication
 */
export function DisplayModeView() {
  const { boardId } = useParams<{ boardId?: string }>();
  const { user, profile } = useAuth();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoard() {
      setLoading(true);
      setError(null);
      
      let targetBoard: Board | null = null;
      
      if (boardId) {
        // Specific board requested
        targetBoard = await getBoardById(boardId);
        if (!targetBoard) {
          setError('Board not found');
          setLoading(false);
          return;
        }
      } else {
        // No board specified - try user preferences fallback
        if (profile?.id) {
          const prefs = await getUserPreferences(profile.id);
          if (prefs?.last_board_id) {
            targetBoard = await getBoardById(prefs.last_board_id);
          }
        }
        
        // If no preference or board not found, default to auto_store board (house list)
        if (!targetBoard) {
          targetBoard = await getAutoStoreBoard();
        }
        
        if (!targetBoard) {
          setError('No default board available');
          setLoading(false);
          return;
        }
      }
      
      // Save this board as last viewed (for logged-in users)
      if (profile?.id && targetBoard) {
        updateLastBoard(profile.id, targetBoard.id);
      }
      
      setBoard(targetBoard);
      
      // Load content based on board type
      if (targetBoard.type === 'auto_store') {
        // House list: all published picks
        const allPicks = await getPublishedPicks();
        setPicks(allPicks);
        setBoardItems([]);
      } else if (targetBoard.type === 'auto_user') {
        // Budtender's picks
        if (targetBoard.owner_user_id) {
          const budtenderPicks = await getPublishedPicksForBudtender(targetBoard.owner_user_id);
          setPicks(budtenderPicks);
        } else {
          setPicks([]);
        }
        setBoardItems([]);
      } else {
        // Custom board: load items
        const items = await getBoardItems(targetBoard.id);
        setBoardItems(items);
        
        // Load picks for pick-type items
        // IMPORTANT: Use getVisiblePicksByIds to filter out archived/inactive picks
        // The render logic will silently skip items where the pick is not found
        const pickIds = items
          .filter(i => i.type === 'pick' && i.pick_id)
          .map(i => i.pick_id!);
        
        if (pickIds.length > 0) {
          const itemPicks = await getVisiblePicksByIds(pickIds);
          setPicks(itemPicks);
        } else {
          setPicks([]);
        }
        
        // Load assets for image-type items
        const assetIds = items
          .filter(i => i.type === 'image' && i.asset_id)
          .map(i => i.asset_id!);
        
        if (assetIds.length > 0) {
          const allAssets = await getAssets();
          setAssets(allAssets.filter(a => assetIds.includes(a.id)));
        } else {
          setAssets([]);
        }
      }
      
      setLoading(false);
    }
    
    loadBoard();
  }, [boardId, profile?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Link to="/display">
          <Button variant="outline">Back to house list</Button>
        </Link>
      </div>
    );
  }

  const isAutoBoard = board?.type === 'auto_store' || board?.type === 'auto_user';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {board?.name || 'House picks'}
            </h1>
            {board?.description && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{board.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <BoardSelector currentBoardId={board?.id} />
            {user ? (
              <Link to="/">
                <Button variant="outline" size="sm">My picks</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {isAutoBoard ? (
          // Auto board: show picks directly
          picks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No picks on this board yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {picks.map(pick => (
                <GuestPickCard key={pick.id} pick={pick} />
              ))}
            </div>
          )
        ) : (
          // Custom board: show board items
          boardItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items on this board yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {boardItems.map(item => {
                if (item.type === 'pick' && item.pick_id) {
                  const pick = picks.find(p => p.id === item.pick_id);
                  
                  // CRITICAL: Silently skip items where pick is archived/inactive/deleted
                  // The pick won't be in the array because getVisiblePicksByIds filtered it
                  // In Display Mode, customers should never see stale item placeholders
                  if (!pick) return null;
                  
                  return <GuestPickCard key={item.id} pick={pick} />;
                }
                
                if (item.type === 'text' && item.text_content) {
                  const isHeading = item.text_variant === 'heading';
                  return (
                    <div 
                      key={item.id} 
                      className={`p-4 ${isHeading ? 'col-span-full' : ''}`}
                    >
                      <p className={isHeading 
                        ? 'text-2xl font-semibold text-foreground' 
                        : 'text-sm text-muted-foreground'
                      }>
                        {item.text_content}
                      </p>
                    </div>
                  );
                }
                
                if (item.type === 'image' && item.asset_id) {
                  const asset = assets.find(a => a.id === item.asset_id);
                  if (!asset) return null;
                  
                  return (
                    <div key={item.id} className="rounded-lg overflow-hidden">
                      <img 
                        src={asset.url} 
                        alt={asset.label || asset.filename || 'Board image'} 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          )
        )}
      </main>

      {/* Footer - minimal branding */}
      <footer className="border-t border-border py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground/60">Guidelight</span>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}

export default DisplayModeView;
