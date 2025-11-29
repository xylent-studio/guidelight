import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadAsset, type MediaAsset, type AssetKind } from '@/lib/api/assets';
import { useAuth } from '@/contexts/AuthContext';

type AssetUploaderProps = {
  kind?: AssetKind;
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

