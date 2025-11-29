# Session 16: Product Selection in Pick Flow + Image Inheritance

---
**Session Metadata**

| Field | Value |
|-------|-------|
| **Phase** | 5 - Product Catalog |
| **Estimated Duration** | 2-3 hours |
| **Prerequisites** | Session 15 completed |
| **Output** | ProductPicker in PickFormModal, auto-fill from product, image inheritance |

---

## Pre-Session Checklist

- [ ] Session 15 completed successfully
- [ ] Products table has data (imported or manual)
- [ ] Products API helpers exist and work
- [ ] `picks.product_id` FK exists
- [ ] `picks.image_asset_id` column exists (from Session 08)
- [ ] Read `docs/guidelight_ux_docs_bundle_vNEXT/11_PRODUCT_CATALOG_AND_ADD_PICK_FLOW.md`

---

## Session Goals

1. Create ProductPicker component with search
2. Integrate ProductPicker into PickFormModal
3. Auto-fill fields from selected product
4. Implement image inheritance logic (product → pick)
5. Allow clearing product link (freeform mode)
6. Support custom image override for picks

---

## Design: Image Inheritance Logic

When displaying a pick's image, use this priority:

1. **Custom uploaded image** (`image_asset_id` is set) → use uploaded asset
2. **Linked product with image** (`product_id` set AND product has image) → use product image
3. **No image** → show category placeholder or no image

In the Pick Form:
- If linked to product with image → show "Using product image" with option to override
- User can upload custom image that overrides product image
- User can clear custom image to revert to product image

---

## Acceptance Criteria

- [ ] ProductPicker searchable dropdown in PickFormModal
- [ ] Selecting product auto-fills: name, brand, category, potency, strain info
- [ ] Product image shows as preview with "Using product image" label
- [ ] Can upload custom image that overrides product image
- [ ] Can clear custom image to revert to product image
- [ ] Can clear product to go freeform
- [ ] `product_id` saved with pick (nullable)
- [ ] Freeform picks still work (product_id = NULL)
- [ ] No errors in `npm run build`

---

## Implementation Steps

### Step 1: Create ProductPicker component

Create `src/components/picks/ProductPicker.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { Search, X, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchProducts, getProductById, Product } from '@/lib/api/products';
import { useDebounce } from '@/hooks/useDebounce';

type ProductPickerProps = {
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
};

export function ProductPicker({ selectedProduct, onSelect }: ProductPickerProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    async function fetchResults() {
      if (debouncedSearch.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      const products = await searchProducts(debouncedSearch);
      setResults(products);
      setLoading(false);
    }
    
    fetchResults();
  }, [debouncedSearch]);

  const handleSelect = (product: Product) => {
    onSelect(product);
    setSearch('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearch('');
  };

  // Product selected - show card
  if (selectedProduct) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          {/* Product image or icon */}
          {selectedProduct.image_url || selectedProduct.image_asset_id ? (
            <img 
              src={selectedProduct.image_url || ''} 
              alt={selectedProduct.name}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
              <Package size={20} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium">{selectedProduct.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedProduct.brand}
              {selectedProduct.thc_percent && ` • ${selectedProduct.thc_percent}% THC`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X size={16} />
        </Button>
      </div>
    );
  }

  // No product selected - show search
  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search product catalog..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9"
        />
      </div>
      
      {isOpen && (search.length >= 2 || results.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <p className="p-3 text-sm text-muted-foreground">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              {search.length >= 2 ? 'No products found' : 'Type to search...'}
            </p>
          ) : (
            results.map(product => (
              <button
                key={product.id}
                className="w-full text-left p-3 hover:bg-accent transition-colors flex items-center gap-3"
                onClick={() => handleSelect(product)}
              >
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Package size={14} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.brand} 
                    {product.product_type && ` • ${product.product_type}`}
                  </p>
                </div>
              </button>
            ))
          )}
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                setSearch('');
              }}
            >
              Enter product manually instead
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 2: Create useDebounce hook (if not exists)

Create `src/hooks/useDebounce.ts`:

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Step 3: Create PickImageSection component

Create `src/components/picks/PickImageSection.tsx`:

```typescript
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
        {hasCustomImage && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearCustom}
            className="text-xs"
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
            <Button size="sm" variant="secondary" onClick={() => setShowUpload(true)}>
              <Upload size={14} className="mr-1" />
              Change
            </Button>
            {hasCustomImage && (
              <Button size="sm" variant="secondary" onClick={handleClearCustom}>
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
```

### Step 4: Integrate ProductPicker into PickFormModal

```typescript
// In PickFormModal.tsx
import { ProductPicker } from './ProductPicker';
import { PickImageSection } from './PickImageSection';
import { getProductById, Product } from '@/lib/api/products';
import { getAssetById, MediaAsset } from '@/lib/api/assets';

// Add state
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [customImage, setCustomImage] = useState<MediaAsset | null>(null);

// Load product if editing pick with product_id
useEffect(() => {
  async function loadProductAndImage() {
    if (pick?.product_id) {
      const product = await getProductById(pick.product_id);
      setSelectedProduct(product);
    }
    if (pick?.image_asset_id) {
      const asset = await getAssetById(pick.image_asset_id);
      setCustomImage(asset);
    }
  }
  loadProductAndImage();
}, [pick?.product_id, pick?.image_asset_id]);

// Handle product selection
const handleProductSelect = (product: Product | null) => {
  setSelectedProduct(product);
  
  if (product) {
    // Auto-fill fields from product
    setFormData(prev => ({
      ...prev,
      product_name: product.name,
      brand: product.brand || prev.brand,
      product_type: product.product_type || prev.product_type,
      category: product.category || prev.category,
      thc_percent: product.thc_percent?.toString() || prev.thc_percent,
      cbd_percent: product.cbd_percent?.toString() || prev.cbd_percent,
      strain_name: product.strain_name || prev.strain_name,
      strain_type: product.strain_type || prev.strain_type,
    }));
  }
};

// Include product_id and image_asset_id in publish
const handlePublish = async () => {
  const pickData = {
    ...formDataToPick(formData),
    product_id: selectedProduct?.id || null,
    image_asset_id: customImage?.id || null,
  };
  // ... rest of publish logic
};

// In render, at top of form:
<div className="space-y-4">
  <div className="space-y-2">
    <Label>Product (optional)</Label>
    <ProductPicker
      selectedProduct={selectedProduct}
      onSelect={handleProductSelect}
    />
    <p className="text-xs text-muted-foreground">
      Search catalog or enter product details manually below
    </p>
  </div>

  <PickImageSection
    customImage={customImage}
    linkedProduct={selectedProduct}
    onCustomImageChange={setCustomImage}
  />
</div>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/picks/ProductPicker.tsx` | Create |
| `src/components/picks/PickImageSection.tsx` | Create |
| `src/hooks/useDebounce.ts` | Create if not exists |
| `src/components/picks/PickFormModal.tsx` | Integrate ProductPicker + images |

---

## Canonical Docs to Update

- [ ] `docs/guidelight_ux_docs_bundle_vNEXT/11_PRODUCT_CATALOG_AND_ADD_PICK_FLOW.md` - Mark product selection as "Implemented"

---

## Post-Session Documentation

- [ ] Update `SESSION_LOG.md` with completion status
- [ ] Test product search and selection
- [ ] Test auto-fill from product
- [ ] Test image inheritance and override
- [ ] Test freeform mode still works
- [ ] Run `npm run build` to confirm no errors

---

## Rollback Plan

If issues occur:
1. Remove ProductPicker and PickImageSection components
2. Revert PickFormModal changes

---

## Next Session

→ **Session 17: Profile Menu (stretch) + Prefs entry point**

