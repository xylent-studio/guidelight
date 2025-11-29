# Session 08a: Asset/Media Library

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 2 - Boards Core (Extension) |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 08 completed |
| **Output** | media_assets table, asset upload/browse components, API helpers |

---

## Pre-Session Checklist

- [ ] Session 08 completed successfully
- [ ] Supabase Storage bucket configured for media uploads
- [ ] `board_items.asset_id` column exists (from Session 08)
- [ ] `picks.image_asset_id` column exists (from Session 08)

---

## Session Goals

1. Create `media_assets` table with proper RLS
2. Set up Supabase Storage bucket for uploads
3. Create asset upload component with drag-drop
4. Create asset browser/picker component
5. Create asset API helpers

---

## Context: Why Asset Library?

The asset library is a shared media repository used by:
- **Board items** (type='image') - logos, clipart, backgrounds
- **Picks** - custom product images (via `image_asset_id`)
- **Products** - custom product images (via `image_asset_id`, coming in Session 15)
- **Future: Themes** - theme-specific backgrounds and decorations

By centralizing media management, we:
- Avoid duplicate uploads
- Enable asset reuse across boards and picks
- Support tagging and organization
- Prepare for future AI-generated assets

---

## Acceptance Criteria

- [ ] `media_assets` table created with all fields
- [ ] RLS policies allow authenticated read, upload own, managers delete
- [ ] Supabase Storage bucket `media` exists and is configured
- [ ] AssetUploader component allows drag-drop upload
- [ ] AssetBrowser component shows grid of assets with search
- [ ] API helpers for upload, list, search, delete work
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create media_assets table migration

```sql
-- Migration: create_media_assets_table

CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File information
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER,  -- bytes
  mime_type TEXT,
  
  -- Categorization
  kind TEXT NOT NULL DEFAULT 'photo',  -- 'logo', 'clipart', 'background', 'photo', 'product'
  label TEXT,  -- Human-friendly name
  tags TEXT[],  -- For searchability
  
  -- Ownership
  uploaded_by UUID REFERENCES public.budtenders(id),
  
  -- Metadata
  width INTEGER,
  height INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX media_assets_kind_idx ON public.media_assets(kind);
CREATE INDEX media_assets_uploaded_by_idx ON public.media_assets(uploaded_by);
CREATE INDEX media_assets_tags_idx ON public.media_assets USING GIN(tags);

-- RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view assets
CREATE POLICY "media_assets_select_authenticated" ON public.media_assets
  FOR SELECT TO authenticated USING (true);

-- Anon can view assets (for Display Mode)
CREATE POLICY "media_assets_select_anon" ON public.media_assets
  FOR SELECT TO anon USING (true);

-- Authenticated users can upload (insert) assets
CREATE POLICY "media_assets_insert_authenticated" ON public.media_assets
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Users can update their own assets
CREATE POLICY "media_assets_update_own" ON public.media_assets
  FOR UPDATE TO authenticated
  USING (uploaded_by IN (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid()));

-- Managers can delete any asset, users can delete their own
CREATE POLICY "media_assets_delete" ON public.media_assets
  FOR DELETE TO authenticated
  USING (
    uploaded_by IN (SELECT id FROM public.budtenders WHERE auth_user_id = auth.uid())
    OR
    (SELECT role FROM public.budtenders WHERE auth_user_id = auth.uid()) = 'manager'
  );

-- Add FK constraints to existing tables
ALTER TABLE public.board_items
  ADD CONSTRAINT board_items_asset_id_fk 
  FOREIGN KEY (asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;

ALTER TABLE public.picks
  ADD CONSTRAINT picks_image_asset_id_fk 
  FOREIGN KEY (image_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;

COMMENT ON TABLE public.media_assets IS 'Centralized media library for images, logos, clipart used across boards and picks.';
```

### Step 2: Configure Supabase Storage bucket

Via Supabase Dashboard or SQL:

```sql
-- Create storage bucket (typically done via dashboard)
-- Bucket name: media
-- Public: false (use signed URLs or RLS)

-- Storage policies (via dashboard):
-- 1. Allow authenticated users to upload to media/*
-- 2. Allow anyone to read from media/* (for public display)
```

### Step 3: Create asset API helpers

Create `src/lib/api/assets.ts`:

```typescript
import { supabase } from '../supabaseClient';
import type { Database } from '@/types/database';

export type MediaAsset = Database['public']['Tables']['media_assets']['Row'];
export type MediaAssetInsert = Database['public']['Tables']['media_assets']['Insert'];

type AssetKind = 'logo' | 'clipart' | 'background' | 'photo' | 'product';

/**
 * Upload a file to storage and create media_assets record
 */
export async function uploadAsset(
  file: File,
  kind: AssetKind,
  uploaderId: string,
  label?: string,
  tags?: string[]
): Promise<MediaAsset | null> {
  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${kind}/${filename}`;
  
  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
    });
  
  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(path);
  
  // Get image dimensions if it's an image
  let width: number | undefined;
  let height: number | undefined;
  
  if (file.type.startsWith('image/')) {
    const dimensions = await getImageDimensions(file);
    width = dimensions.width;
    height = dimensions.height;
  }
  
  // Create media_assets record
  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      url: urlData.publicUrl,
      filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      kind,
      label: label || file.name.replace(/\.[^/.]+$/, ''),
      tags,
      uploaded_by: uploaderId,
      width,
      height,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating asset record:', error);
    // Try to clean up uploaded file
    await supabase.storage.from('media').remove([path]);
    return null;
  }
  
  return data;
}

/**
 * Get image dimensions from File
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get all assets, optionally filtered by kind
 */
export async function getAssets(kind?: AssetKind, limit = 50): Promise<MediaAsset[]> {
  let query = supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (kind) {
    query = query.eq('kind', kind);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Search assets by label or tags
 */
export async function searchAssets(query: string, kind?: AssetKind): Promise<MediaAsset[]> {
  let dbQuery = supabase
    .from('media_assets')
    .select('*')
    .or(`label.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false })
    .limit(30);
  
  if (kind) {
    dbQuery = dbQuery.eq('kind', kind);
  }
  
  const { data, error } = await dbQuery;
  
  if (error) {
    console.error('Error searching assets:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(assetId: string): Promise<MediaAsset | null> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', assetId)
    .single();
  
  if (error) {
    console.error('Error fetching asset:', error);
    return null;
  }
  
  return data;
}

/**
 * Delete an asset (removes file from storage and record from DB)
 */
export async function deleteAsset(assetId: string): Promise<boolean> {
  // Get asset to find file path
  const asset = await getAssetById(assetId);
  if (!asset) return false;
  
  // Extract path from URL
  const url = new URL(asset.url);
  const path = url.pathname.split('/media/')[1];
  
  // Delete from storage
  if (path) {
    await supabase.storage.from('media').remove([path]);
  }
  
  // Delete record
  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', assetId);
  
  if (error) {
    console.error('Error deleting asset:', error);
    return false;
  }
  
  return true;
}

/**
 * Update asset metadata (label, tags)
 */
export async function updateAsset(
  assetId: string, 
  updates: { label?: string; tags?: string[] }
): Promise<MediaAsset | null> {
  const { data, error } = await supabase
    .from('media_assets')
    .update(updates)
    .eq('id', assetId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating asset:', error);
    return null;
  }
  
  return data;
}
```

### Step 4: Create AssetUploader component

Create `src/components/boards/AssetUploader.tsx`:

```typescript
import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadAsset, MediaAsset } from '@/lib/api/assets';
import { useAuth } from '@/hooks/useAuth';

type AssetUploaderProps = {
  kind?: 'logo' | 'clipart' | 'background' | 'photo' | 'product';
  onUploadComplete: (asset: MediaAsset) => void;
  onCancel?: () => void;
};

export function AssetUploader({ 
  kind = 'photo', 
  onUploadComplete,
  onCancel,
}: AssetUploaderProps) {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setLabel(selectedFile.name.replace(/\.[^/.]+$/, ''));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!file || !profile) return;
    
    setUploading(true);
    
    const asset = await uploadAsset(file, kind, profile.id, label);
    
    setUploading(false);
    
    if (asset) {
      onUploadComplete(asset);
    } else {
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setLabel('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={32} className="text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Drag & drop an image here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WebP up to 10MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={preview || ''} 
              alt="Preview" 
              className="w-full h-48 object-contain rounded-lg bg-muted"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80"
              onClick={handleClear}
            >
              <X size={16} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Image name..."
            />
          </div>
          
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={uploading}>
                Cancel
              </Button>
            )}
            <Button onClick={handleUpload} disabled={uploading} className="flex-1">
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Create AssetBrowser component

Create `src/components/boards/AssetBrowser.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { Search, Upload, Trash2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAssets, searchAssets, deleteAsset, MediaAsset } from '@/lib/api/assets';
import { AssetUploader } from './AssetUploader';
import { useAuth } from '@/hooks/useAuth';

type AssetBrowserProps = {
  onSelect: (asset: MediaAsset) => void;
  selectedId?: string;
  kind?: 'logo' | 'clipart' | 'background' | 'photo' | 'product' | 'all';
};

export function AssetBrowser({ onSelect, selectedId, kind = 'all' }: AssetBrowserProps) {
  const { profile } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeKind, setActiveKind] = useState<string>(kind === 'all' ? 'all' : kind);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [activeKind]);

  async function loadAssets() {
    setLoading(true);
    const kindFilter = activeKind === 'all' ? undefined : activeKind as any;
    const data = await getAssets(kindFilter);
    setAssets(data);
    setLoading(false);
  }

  async function handleSearch() {
    if (!search.trim()) {
      loadAssets();
      return;
    }
    
    setLoading(true);
    const kindFilter = activeKind === 'all' ? undefined : activeKind as any;
    const data = await searchAssets(search, kindFilter);
    setAssets(data);
    setLoading(false);
  }

  async function handleDelete(asset: MediaAsset) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    
    const success = await deleteAsset(asset.id);
    if (success) {
      setAssets(prev => prev.filter(a => a.id !== asset.id));
    }
  }

  const canDelete = (asset: MediaAsset) => {
    if (!profile) return false;
    return asset.uploaded_by === profile.id || profile.role === 'manager';
  };

  return (
    <div className="space-y-4">
      {/* Search and Upload */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search images..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload size={16} className="mr-2" />
          Upload
        </Button>
      </div>

      {/* Kind filter tabs */}
      {kind === 'all' && (
        <Tabs value={activeKind} onValueChange={setActiveKind}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="photo">Photos</TabsTrigger>
            <TabsTrigger value="product">Products</TabsTrigger>
            <TabsTrigger value="logo">Logos</TabsTrigger>
            <TabsTrigger value="clipart">Clipart</TabsTrigger>
            <TabsTrigger value="background">Backgrounds</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Asset grid */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading images...
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No images found
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
          {assets.map(asset => (
            <div 
              key={asset.id}
              className={`
                relative group cursor-pointer rounded-lg overflow-hidden
                border-2 transition-all
                ${selectedId === asset.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}
              `}
              onClick={() => onSelect(asset)}
            >
              <img 
                src={asset.url} 
                alt={asset.label || asset.filename}
                className="w-full aspect-square object-cover"
              />
              
              {/* Selected indicator */}
              {selectedId === asset.id && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Check size={12} />
                </div>
              )}
              
              {/* Delete button (on hover) */}
              {canDelete(asset) && (
                <button
                  className="
                    absolute top-1 left-1 p-1 rounded
                    bg-destructive text-destructive-foreground
                    opacity-0 group-hover:opacity-100 transition-opacity
                  "
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(asset);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}
              
              {/* Label overlay */}
              <div className="
                absolute bottom-0 left-0 right-0 
                bg-gradient-to-t from-black/60 to-transparent
                p-1 pt-4
              ">
                <p className="text-xs text-white truncate">
                  {asset.label || asset.filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload image</DialogTitle>
          </DialogHeader>
          <AssetUploader
            kind={activeKind === 'all' ? 'photo' : activeKind as any}
            onUploadComplete={(asset) => {
              setAssets(prev => [asset, ...prev]);
              setShowUpload(false);
            }}
            onCancel={() => setShowUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### Step 6: Regenerate TypeScript types

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| Migration: `create_media_assets_table` | Create via MCP |
| `src/lib/api/assets.ts` | Create |
| `src/components/boards/AssetUploader.tsx` | Create |
| `src/components/boards/AssetBrowser.tsx` | Create |
| `src/types/database.ts` | Regenerate |

---

## Storage Configuration

**Supabase Storage bucket: `media`**

Required policies:
1. **Upload**: Authenticated users can upload to `media/*`
2. **Read**: Public read access for display
3. **Delete**: Users can delete own files, managers can delete any

---

## Canonical Docs to Update

- [ ] `docs/CANVAS_AND_SIGNAGE_VISION.md` - Note asset library implemented

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test file upload via AssetUploader
- [ ] Test asset browsing and search
- [ ] Test asset deletion (own + manager permissions)
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove AssetUploader and AssetBrowser components
2. Remove assets API helpers
3. Drop `media_assets` table if needed
4. Remove storage bucket if created

---

## Next Session

→ **Session 08b: Image Board Items**




