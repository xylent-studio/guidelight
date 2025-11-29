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

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedAsset(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add image to board</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'browse' | 'upload')} className="flex-1">
          <TabsList>
            <TabsTrigger value="browse">Browse Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="flex-1 mt-4">
            <AssetBrowser
              onSelect={handleSelect}
              selectedId={selectedAsset?.id}
              kind="all"
            />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
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

