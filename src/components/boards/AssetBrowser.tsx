import { useState, useEffect } from 'react';
import { Search, Upload, Trash2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAssets, searchAssets, deleteAsset, type MediaAsset, type AssetKind } from '@/lib/api/assets';
import { AssetUploader } from './AssetUploader';
import { useAuth } from '@/contexts/AuthContext';

type AssetBrowserProps = {
  onSelect: (asset: MediaAsset) => void;
  selectedId?: string;
  kind?: AssetKind | 'all';
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
    const kindFilter = activeKind === 'all' ? undefined : activeKind as AssetKind;
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
    const kindFilter = activeKind === 'all' ? undefined : activeKind as AssetKind;
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
            kind={activeKind === 'all' ? 'photo' : activeKind as AssetKind}
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

