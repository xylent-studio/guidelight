import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Type, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBar } from '@/components/ui/HeaderBar';
import { BoardCanvas } from '@/components/boards/BoardCanvas';
import { CanvasPickCard } from '@/components/boards/CanvasPickCard';
import { AddPickDialog } from '@/components/boards/AddPickDialog';
import { AddTextDialog } from '@/components/boards/AddTextDialog';
import { AddImageDialog } from '@/components/boards/AddImageDialog';
import { 
  getBoardById, 
  getBoardItems, 
  removeBoardItem, 
  loadAutoboardPicks,
  updateBoardItemsOrder,
  updateBoard,
  addPickToBoard,
  addTextToBoard,
  updateTextBlock,
  deleteBoard,
  addImageToBoard,
} from '@/lib/api/boards';
import type { Board, BoardItem, AttributionStyle } from '@/lib/api/boards';
import { getAllPicksByIds } from '@/lib/api/picks';
import { getAssetsByIds, type MediaAsset } from '@/lib/api/assets';
import type { Database } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

type Pick = Database['public']['Tables']['picks']['Row'] & {
  // Session 08: Extended with budtender name for attribution
  budtenders?: { name: string } | null;
};
type SaveStatus = 'idle' | 'saving' | 'saved';

export function BoardEditorView() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Board editing state
  const [editingName, setEditingName] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Session 07: Add pick dialog state
  const [showAddPick, setShowAddPick] = useState(false);
  
  // Session 08: Add text dialog state
  const [showAddText, setShowAddText] = useState(false);
  
  // Session 08b: Add image dialog state and assets
  const [showAddImage, setShowAddImage] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  
  // Session 08: Permission check
  const canEdit = board?.owner_user_id === profile?.id || profile?.role === 'manager';

  useEffect(() => {
    async function loadBoard() {
      if (!boardId) return;
      
      setLoading(true);
      
      const boardData = await getBoardById(boardId);
      if (!boardData) {
        navigate('/boards');
        return;
      }
      setBoard(boardData);
      setEditingName(boardData.name);
      
      // For auto boards, content is computed (all published picks)
      // For custom boards, load board_items
      if (boardData.type === 'auto_store' || boardData.type === 'auto_user') {
        // Load all active picks for auto boards
        const allPicks = await loadAutoboardPicks(boardData);
        setPicks(allPicks);
        // Auto boards don't use board_items - picks ARE the content
        setItems([]);
      } else {
        // Custom board - load items
        const itemsData = await getBoardItems(boardId);
        setItems(itemsData);
        
        // Load pick data for pick-type items
        const pickIds = itemsData
          .filter(i => i.type === 'pick' && i.pick_id)
          .map(i => i.pick_id!);
        
        if (pickIds.length > 0) {
          const pickData = await getAllPicksByIds(pickIds);
          setPicks(pickData);
        }
      }
      
      setLoading(false);
    }
    
    loadBoard();
    
    // Cleanup timeouts on unmount
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);
    };
  }, [boardId, navigate]);

  // Session 08b: Load assets when items change
  useEffect(() => {
    async function loadAssets() {
      const assetIds = items
        .filter(i => i.type === 'image' && i.asset_id)
        .map(i => i.asset_id!);
      
      if (assetIds.length > 0) {
        const loadedAssets = await getAssetsByIds(assetIds);
        setAssets(loadedAssets);
      } else {
        setAssets([]);
      }
    }
    
    loadAssets();
  }, [items]);

  // Handle reordering items (drag-drop)
  const handleReorder = useCallback(async (newItems: BoardItem[]) => {
    if (!boardId) return;
    
    // Optimistically update local state
    setItems(newItems);
    setSaveStatus('saving');
    
    // Debounce save to avoid hammering the API during rapid drags
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      await updateBoardItemsOrder(boardId, newItems);
      setSaveStatus('saved');
      
      // Reset to idle after 2s
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, [boardId]);

  // Handle removing board items (stale or user-initiated)
  const handleRemoveItem = async (item: BoardItem) => {
    const success = await removeBoardItem(item.id);
    if (success) {
      setItems(prev => prev.filter(i => i.id !== item.id));
      // Also remove from picks if it's a pick item
      if (item.pick_id) {
        setPicks(prev => prev.filter(p => p.id !== item.pick_id));
      }
    }
  };

  // Session 07: Handle adding a pick to the board
  const handleAddPick = async (pick: Pick, attributionStyle: AttributionStyle) => {
    if (!boardId) return;
    
    const newItem = await addPickToBoard(boardId, pick.id, attributionStyle);
    if (newItem) {
      setItems(prev => [...prev, newItem]);
      // Also add the pick to our local picks state
      setPicks(prev => [...prev, pick]);
    }
  };

  // Session 08: Handle adding text to the board
  const handleAddText = async (content: string, variant: 'heading' | 'body') => {
    if (!boardId) return;
    
    const newItem = await addTextToBoard(boardId, content, variant);
    if (newItem) {
      setItems(prev => [...prev, newItem]);
    }
  };

  // Session 08: Handle updating text content
  const handleUpdateText = async (itemId: string, content: string) => {
    const success = await updateTextBlock(itemId, content);
    if (success) {
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, text_content: content } : item
      ));
    }
  };

  // Session 08b: Handle adding an image to the board
  const handleAddImage = async (asset: MediaAsset) => {
    if (!boardId) return;
    
    const newItem = await addImageToBoard(boardId, asset.id);
    if (newItem) {
      setItems(prev => [...prev, newItem]);
      // Also add the asset to our local assets state
      setAssets(prev => [...prev, asset]);
    }
  };

  // Session 08: Handle deleting the board
  const handleDeleteBoard = async () => {
    if (!boardId || !board) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${board.name}"? This cannot be undone.`
    );
    if (!confirmed) return;
    
    const success = await deleteBoard(boardId);
    if (success) {
      navigate('/boards');
    }
  };

  // Handle board name change (debounced autosave)
  const handleNameChange = useCallback((newName: string) => {
    if (!boardId || !board) return;
    
    setEditingName(newName);
    setSaveStatus('saving');
    
    // Debounce save
    if (nameTimeoutRef.current) {
      clearTimeout(nameTimeoutRef.current);
    }
    
    nameTimeoutRef.current = setTimeout(async () => {
      const updated = await updateBoard(boardId, { name: newName });
      if (updated) {
        setBoard(updated);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, [boardId, board]);

  // Handle status toggle
  const handleToggleStatus = useCallback(async () => {
    if (!boardId || !board) return;
    
    const newStatus = board.status === 'published' ? 'unpublished' : 'published';
    setSaveStatus('saving');
    
    const updated = await updateBoard(boardId, { status: newStatus });
    if (updated) {
      setBoard(updated);
    }
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [boardId, board]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const isAutoBoard = board.type === 'auto_store' || board.type === 'auto_user';
  const isCustomBoard = board.type === 'custom';

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar
        showBackButton
        onBack={() => { navigate('/boards'); }}
        title=""
        rightActions={
          <div className="flex items-center gap-3">
            {/* Save status indicator */}
            {saveStatus !== 'idle' && (
              <span className="text-sm text-muted-foreground">
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>
            )}
            
            {/* Add pick button (only for custom boards with edit permission) */}
            {isCustomBoard && canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddPick(true)}
              >
                <Plus size={16} className="mr-1" />
                Add pick
              </Button>
            )}
            
            {/* Session 08: Add text button */}
            {isCustomBoard && canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddText(true)}
              >
                <Type size={16} className="mr-1" />
                Add text
              </Button>
            )}
            
            {/* Session 08b: Add image button */}
            {isCustomBoard && canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddImage(true)}
              >
                <ImageIcon size={16} className="mr-1" />
                Add image
              </Button>
            )}
            
            {/* Session 08: Delete board button */}
            {isCustomBoard && canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteBoard}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            )}
            
            {/* Status toggle (only for custom boards with edit permission) */}
            {isCustomBoard && canEdit && (
              <Button
                variant={board.status === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleStatus}
              >
                {board.status === 'published' ? 'Published' : 'Publish'}
              </Button>
            )}
          </div>
        }
      />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Board toolbar - editable name (only if canEdit) */}
        <div className="mb-6">
          {isCustomBoard && canEdit ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -ml-1 w-full max-w-md"
              placeholder="Board name"
            />
          ) : (
            <h1 className="text-2xl font-bold">{board.name}</h1>
          )}
          
          {board.description && (
            <p className="text-muted-foreground mt-2">{board.description}</p>
          )}
        </div>
        
        {isAutoBoard ? (
          // Auto board: show picks directly (already filtered to published/active)
          picks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map(pick => (
                <CanvasPickCard key={pick.id} pick={pick} mode="canvas" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No picks yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                {board.type === 'auto_store' 
                  ? 'Staff picks will appear here when published'
                  : 'Your published picks will appear here'
                }
              </p>
            </div>
          )
        ) : (
          // Custom board: show board items with drag-drop
          items.length > 0 ? (
            <BoardCanvas
              items={items}
              picks={picks}
              assets={assets}
              mode={canEdit ? 'edit' : 'display'}
              onReorder={canEdit ? handleReorder : undefined}
              onRemoveItem={canEdit ? handleRemoveItem : undefined}
              onUpdateText={canEdit ? handleUpdateText : undefined}
            />
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">This board is empty</p>
              <p className="text-sm text-muted-foreground mt-2">
                Use Add pick to add recommendations
              </p>
            </div>
          )
        )}
      </main>
      
      {/* Session 07: Add Pick Dialog */}
      {isCustomBoard && canEdit && board.owner_user_id && (
        <AddPickDialog
          open={showAddPick}
          onClose={() => setShowAddPick(false)}
          onSelectPick={handleAddPick}
          excludePickIds={items.filter(i => i.pick_id).map(i => i.pick_id!)}
          boardOwnerId={board.owner_user_id}
        />
      )}
      
      {/* Session 08: Add Text Dialog */}
      {isCustomBoard && canEdit && (
        <AddTextDialog
          open={showAddText}
          onClose={() => setShowAddText(false)}
          onAdd={handleAddText}
        />
      )}
      
      {/* Session 08b: Add Image Dialog */}
      {isCustomBoard && canEdit && (
        <AddImageDialog
          open={showAddImage}
          onClose={() => setShowAddImage(false)}
          onSelect={handleAddImage}
        />
      )}
    </div>
  );
}

export default BoardEditorView;
