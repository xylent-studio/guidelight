import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { Database } from '@/types/database';
import { CanvasPickCard } from './CanvasPickCard';
import { CanvasTextBlock } from './CanvasTextBlock';
import { CanvasImageBlock } from './CanvasImageBlock';
import { StalePickPlaceholder } from './StalePickPlaceholder';
import type { MediaAsset } from '@/lib/api/assets';

type BoardItem = Database['public']['Tables']['board_items']['Row'];
type Pick = Database['public']['Tables']['picks']['Row'] & {
  // Session 08: Extended with budtender name for attribution
  budtenders?: { name: string } | null;
};

type BoardCanvasProps = {
  items: BoardItem[];
  picks: Pick[];  // Picks data for pick-type items (already filtered by status/is_active)
  assets?: MediaAsset[];  // Session 08b: Assets data for image-type items
  mode?: 'edit' | 'display';
  onReorder?: (items: BoardItem[]) => void;
  onItemClick?: (item: BoardItem) => void;
  onRemoveItem?: (item: BoardItem) => void;  // For removing stale items
  onUpdateText?: (itemId: string, content: string) => void;  // Session 08: Update text block
};

/**
 * Board canvas component that renders board items in a grid layout.
 * Handles both pick-type and text-type items with defensive rendering
 * for archived/inactive picks.
 * Supports drag-drop reordering in edit mode.
 */
export function BoardCanvas({ 
  items, 
  picks, 
  assets = [],
  mode = 'edit', 
  onReorder,
  onItemClick,
  onRemoveItem,
  onUpdateText,
}: BoardCanvasProps) {
  // IMPORTANT: Include TouchSensor for mobile support
  // Distance constraint helps distinguish tap from drag intent
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,     // Prevent accidental drags - must hold 200ms
        tolerance: 5,   // Allow slight movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Create a map of pick_id to Pick for quick lookup
  const picksMap = new Map(picks.map(p => [p.id, p]));
  
  // Session 08b: Create a map of asset_id to MediaAsset for quick lookup
  const assetsMap = new Map(assets.map(a => [a.id, a]));
  
  // Sort items by sort_index for consistent ordering
  const sortedItems = [...items].sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0));
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex(i => i.id === active.id);
      const newIndex = sortedItems.findIndex(i => i.id === over.id);
      
      const newItems = arrayMove(sortedItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sort_index: index,
      }));
      
      onReorder?.(newItems);
    }
  }
  
  // Render a single item
  const renderItem = (item: BoardItem) => {
    // Handle pick-type items
    if (item.type === 'pick' && item.pick_id) {
      const pick = picksMap.get(item.pick_id);
      
      // CRITICAL: Handle archived/inactive/missing picks
      if (!pick) {
        // In display mode: silently skip
        if (mode === 'display') {
          return null;
        }
        // In edit mode: show warning placeholder
        return (
          <StalePickPlaceholder
            key={item.id}
            pickId={item.pick_id}
            onRemove={onRemoveItem ? () => onRemoveItem(item) : undefined}
          />
        );
      }
      
      // Safety check: verify pick is published in display mode
      if (mode === 'display' && pick.status !== 'published') {
        return null;
      }
      
      // Session 08: Construct attribution from item.attribution_style and pick's budtender name
      const attribution = item.attribution_style && pick.budtenders?.name
        ? { budtenderName: pick.budtenders.name, style: item.attribution_style as 'prominent' | 'subtle' }
        : undefined;
      
      return (
        <CanvasPickCard
          key={item.id}
          itemId={mode === 'edit' ? item.id : undefined}
          pick={pick}
          mode={mode === 'display' ? 'display' : 'canvas'}
          onClick={() => onItemClick?.(item)}
          onRemove={mode === 'edit' && onRemoveItem ? () => onRemoveItem(item) : undefined}
          attribution={attribution}
        />
      );
    }
    
    // Handle text-type items
    if (item.type === 'text' && item.text_content) {
      return (
        <CanvasTextBlock
          key={item.id}
          itemId={mode === 'edit' ? item.id : undefined}
          content={item.text_content}
          variant={(item.text_variant as 'heading' | 'body') || 'body'}
          mode={mode}
          onClick={() => onItemClick?.(item)}
          onUpdate={mode === 'edit' && onUpdateText 
            ? (newContent: string) => onUpdateText(item.id, newContent) 
            : undefined}
          onRemove={mode === 'edit' && onRemoveItem ? () => onRemoveItem(item) : undefined}
        />
      );
    }
    
    // Session 08b: Handle image-type items
    if (item.type === 'image' && item.asset_id) {
      const asset = assetsMap.get(item.asset_id);
      
      // CRITICAL: Handle missing assets
      if (!asset) {
        // In display mode: silently skip
        if (mode === 'display') {
          return null;
        }
        // In edit mode: show warning placeholder
        return (
          <div 
            key={item.id}
            className="p-4 border border-dashed border-destructive/50 rounded-lg bg-destructive/5"
          >
            <p className="text-sm text-destructive">Image not found</p>
            {onRemoveItem && (
              <button 
                className="text-xs text-destructive underline mt-1"
                onClick={() => onRemoveItem(item)}
              >
                Remove
              </button>
            )}
          </div>
        );
      }
      
      return (
        <CanvasImageBlock
          key={item.id}
          itemId={mode === 'edit' ? item.id : undefined}
          asset={asset}
          mode={mode}
          onClick={() => onItemClick?.(item)}
          onRemove={mode === 'edit' && onRemoveItem ? () => onRemoveItem(item) : undefined}
        />
      );
    }
    
    // Unknown item type - skip
    return null;
  };
  
  // Display mode - no drag
  if (mode === 'display') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedItems.map(renderItem)}
      </div>
    );
  }
  
  // Edit mode - with drag-drop
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={sortedItems.map(i => i.id)} 
        strategy={rectSortingStrategy}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map(renderItem)}
        </div>
      </SortableContext>
    </DndContext>
  );
}
