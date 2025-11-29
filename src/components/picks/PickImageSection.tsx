import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AssetUploader } from '@/components/boards/AssetUploader';
import type { MediaAsset } from '@/lib/api/assets';
import type { Product } from '@/lib/api/products';

type PickImageSectionProps = {
  customImage: MediaAsset | null;
  linkedProduct: Product | null;
  onCustomImageChange: (asset: MediaAsset | null) => void;
};

/**
 * Image section for pick form with inheritance logic:
 * 1. Custom uploaded image takes priority
 * 2. Linked product image shown if no custom
 * 3. Placeholder if no image at all
 */
export function PickImageSection({ 
  customImage, 
  linkedProduct, 
  onCustomImageChange 
}: PickImageSectionProps) {
  const [showUpload, setShowUpload] = useState(false);

  // Determine current image state
  const hasCustomImage = !!customImage;
  const hasProductImage = linkedProduct && (linkedProduct.image_url || linkedProduct.image_asset_id);
  const currentImageUrl = hasCustomImage 
    ? customImage?.url 
    : (linkedProduct?.image_url || null);

  const handleUploadComplete = (asset: MediaAsset) => {
    onCustomImageChange(asset);
    setShowUpload(false);
  };

  const handleClearCustom = () => {
    onCustomImageChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Pick Image</span>
        {hasCustomImage && hasProductImage && (
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={handleClearCustom}
            className="text-xs h-auto py-1"
          >
            Use product image
          </Button>
        )}
      </div>

      {currentImageUrl ? (
        <div className="relative group">
          <img 
            src={currentImageUrl} 
            alt="Pick image" 
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button 
              type="button" 
              size="sm" 
              variant="secondary" 
              onClick={() => setShowUpload(true)}
            >
              <Upload size={14} className="mr-1" />
              Change
            </Button>
            {hasCustomImage && (
              <Button 
                type="button" 
                size="sm" 
                variant="secondary" 
                onClick={handleClearCustom}
              >
                <X size={14} className="mr-1" />
                Remove
              </Button>
            )}
          </div>
          {!hasCustomImage && hasProductImage && (
            <div className="absolute bottom-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">
              Using product image
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors"
        >
          <ImageIcon size={24} className="mb-2" />
          <span className="text-sm">Add image (optional)</span>
        </button>
      )}

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload pick image</DialogTitle>
          </DialogHeader>
          <AssetUploader
            kind="product"
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

