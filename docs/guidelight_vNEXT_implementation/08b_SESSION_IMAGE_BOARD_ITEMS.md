# Session 08b: Image Board Items

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 2 - Boards Core (Extension) |
| **Estimated Duration** | 2 hours |
| **Prerequisites** | Session 08a completed |
| **Output** | AddImageDialog, CanvasImageBlock, image rendering on boards |

---

## Pre-Session Checklist

- [ ] Session 08a completed successfully
- [ ] `media_assets` table exists with data
- [ ] AssetUploader and AssetBrowser components working
- [ ] `board_item_type` enum includes `image` (from Session 08)
- [ ] `board_items.asset_id` column exists (from Session 08)

---

## Session Goals

1. Create `AddImageDialog` component for selecting/uploading images
2. Create `CanvasImageBlock` component for rendering images
3. Update `BoardCanvas` to render image-type items
4. Add "Add image" button to board editor toolbar
5. Create API helper for adding image to board

---

## Acceptance Criteria

- [ ] "Add image" button opens AddImageDialog
- [ ] Can select from existing assets or upload new
- [ ] Image items render in board canvas with drag handle
- [ ] Images can be removed from board
- [ ] Images render correctly in display mode
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create AddImageDialog

Create `src/components/boards/AddImageDialog.tsx`:

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetBrowser } from './AssetBrowser';
import { AssetUploader } from './AssetUploader';
import type { MediaAsset } from '@/lib/api/assets';

type AddImageDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
};

export function AddImageDialog({ open, onClose, onSelect }: AddImageDialogProps) {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');

  const handleSelect = (asset: MediaAsset) => {
    setSelectedAsset(asset);
  };

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      setSelectedAsset(null);
      onClose();
    }
  };

  const handleUploadComplete = (asset: MediaAsset) => {
    onSelect(asset);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add image to board</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <TabsList>
            <TabsTrigger value="browse">Browse Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="flex-1">
            <AssetBrowser
              onSelect={handleSelect}
              selectedId={selectedAsset?.id}
              kind="all"
            />
          </TabsContent>
          
          <TabsContent value="upload">
            <AssetUploader
              kind="photo"
              onUploadComplete={handleUploadComplete}
              onCancel={() => setActiveTab('browse')}
            />
          </TabsContent>
        </Tabs>

        {activeTab === 'browse' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedAsset}>
              Add to board
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Step 2: Create CanvasImageBlock

Create `src/components/boards/CanvasImageBlock.tsx`:

```typescript
import { X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MediaAsset } from '@/lib/api/assets';

type CanvasImageBlockProps = {
  asset: MediaAsset;
  itemId?: string;  // For sortable
  mode?: 'edit' | 'display';
  onRemove?: () => void;
  onClick?: () => void;
};

export function CanvasImageBlock({ 
  asset, 
  itemId,
  mode = 'edit',
  onRemove,
  onClick,
}: CanvasImageBlockProps) {
  const isDraggable = mode === 'edit' && !!itemId;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId || 'non-draggable', disabled: !isDraggable });
  
  const style = isDraggable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const isEditable = mode === 'edit';

  return (
    <div 
      ref={isDraggable ? setNodeRef : undefined}
      style={style}
      className={`
        relative group rounded-lg overflow-hidden
        ${isEditable ? 'cursor-pointer' : ''}
        ${isDragging ? 'ring-2 ring-primary z-10' : ''}
      `}
      onClick={onClick}
    >
      <img 
        src={asset.url} 
        alt={asset.label || asset.filename}
        className="w-full h-auto max-h-64 object-contain bg-muted"
      />
      
      {isDraggable && (
        <>
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="
              absolute top-2 right-2 p-1.5
              bg-background/80 backdrop-blur-sm rounded
              text-muted-foreground hover:text-foreground 
              cursor-grab active:cursor-grabbing
              opacity-0 group-hover:opacity-100 transition-opacity
            "
            style={{ touchAction: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={16} />
          </button>
          
          {/* Remove button */}
          {onRemove && (
            <button
              className="
                absolute top-2 right-10 p-1.5
                bg-background/80 backdrop-blur-sm rounded
                text-muted-foreground hover:text-destructive
                opacity-0 group-hover:opacity-100 transition-opacity
              "
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X size={16} />
            </button>
          )}
        </>
      )}
      
      {/* Label overlay (display mode or hover) */}
      {asset.label && (
        <div className={`
          absolute bottom-0 left-0 right-0 
          bg-gradient-to-t from-black/60 to-transparent
          p-2 pt-6
          ${mode === 'edit' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}
        `}>
          <p className="text-xs text-white truncate">
            {asset.label}
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 3: Add API helper for image items

Add to `src/lib/api/boards.ts`:

```typescript
/**
 * Add an image to a board
 */
export async function addImageToBoard(boardId: string, assetId: string): Promise<BoardItem | null> {
  const { data: existing } = await supabase
    .from('board_items')
    .select('sort_index')
    .eq('board_id', boardId)
    .order('sort_index', { ascending: false })
    .limit(1);
  
  const nextSortIndex = existing && existing.length > 0 ? (existing[0].sort_index ?? 0) + 1 : 0;
  
  const { data, error } = await supabase
    .from('board_items')
    .insert({
      board_id: boardId,
      type: 'image',
      asset_id: assetId,
      sort_index: nextSortIndex,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding image to board:', error);
    return null;
  }
  
  return data;
}
```

### Step 4: Update BoardCanvas to render images

Update `src/components/boards/BoardCanvas.tsx`:

```typescript
import { CanvasImageBlock } from './CanvasImageBlock';
import type { MediaAsset } from '@/lib/api/assets';

type BoardCanvasProps = {
  items: BoardItem[];
  picks: Pick[];
  assets: MediaAsset[];  // ADD: Pass loaded assets
  mode?: 'edit' | 'display';
  onReorder?: (items: BoardItem[]) => void;
  onItemClick?: (item: BoardItem) => void;
  onRemoveItem?: (item: BoardItem) => void;
};

// Inside renderItem function, add case for image items:
const renderItem = (item: BoardItem) => {
  // ... existing pick handling ...
  
  // ... existing text handling ...
  
  // Handle image-type items
  if (item.type === 'image' && item.asset_id) {
    const asset = assetsMap.get(item.asset_id);
    
    if (!asset) {
      // Asset not found - skip in display mode, show placeholder in edit
      if (mode === 'display') {
        return null;
      }
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
  
  // Unknown item type
  return null;
};

// At the top of the component, create assets map:
const assetsMap = new Map(assets.map(a => [a.id, a]));
```

### Step 5: Update BoardEditorView to load assets

Update `src/views/BoardEditorView.tsx`:

```typescript
import { AddImageDialog } from '@/components/boards/AddImageDialog';
import { addImageToBoard } from '@/lib/api/boards';
import { getAssetById, MediaAsset } from '@/lib/api/assets';

// Add state
const [assets, setAssets] = useState<MediaAsset[]>([]);
const [showAddImage, setShowAddImage] = useState(false);

// Load assets when loading board items
useEffect(() => {
  async function loadAssets() {
    const assetIds = items
      .filter(i => i.type === 'image' && i.asset_id)
      .map(i => i.asset_id!);
    
    if (assetIds.length > 0) {
      const loadedAssets = await Promise.all(
        assetIds.map(id => getAssetById(id))
      );
      setAssets(loadedAssets.filter((a): a is MediaAsset => a !== null));
    }
  }
  
  loadAssets();
}, [items]);

// Add handler
const handleAddImage = async (asset: MediaAsset) => {
  if (!boardId) return;
  
  const newItem = await addImageToBoard(boardId, asset.id);
  if (newItem) {
    setItems(prev => [...prev, newItem]);
    setAssets(prev => [...prev, asset]);
  }
};

// In toolbar, add button:
{isCustomBoard && canEdit && (
  <Button variant="outline" size="sm" onClick={() => setShowAddImage(true)}>
    <ImageIcon size={16} className="mr-2" />
    Add image
  </Button>
)}

// Pass assets to BoardCanvas:
<BoardCanvas
  items={items}
  picks={picks}
  assets={assets}  // ADD
  mode="edit"
  onReorder={handleReorder}
  onRemoveItem={handleRemoveItem}
/>

// Add dialog:
<AddImageDialog
  open={showAddImage}
  onClose={() => setShowAddImage(false)}
  onSelect={handleAddImage}
/>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/boards/AddImageDialog.tsx` | Create |
| `src/components/boards/CanvasImageBlock.tsx` | Create |
| `src/components/boards/BoardCanvas.tsx` | Add image rendering |
| `src/views/BoardEditorView.tsx` | Add image button, dialog, asset loading |
| `src/lib/api/boards.ts` | Add addImageToBoard helper |

---

## Canonical Docs to Update

- [ ] `docs/CANVAS_AND_SIGNAGE_VISION.md` - Note image items implemented

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test adding images from library
- [ ] Test uploading new images via dialog
- [ ] Test image drag-drop reordering
- [ ] Test image removal
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove AddImageDialog and CanvasImageBlock components
2. Revert BoardCanvas and BoardEditorView changes
3. Remove addImageToBoard API helper

---

## Next Session

→ **Session 09: Pick Drafts API**




