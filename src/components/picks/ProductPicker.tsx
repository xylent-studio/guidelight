import { useState, useEffect, useRef } from 'react';
import { Search, X, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchProducts, type Product } from '@/lib/api/products';
import { useDebounce } from '@/hooks/useDebounce';

type ProductPickerProps = {
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
};

/**
 * Searchable product picker for linking picks to the product catalog.
 * Shows search results as user types, allows clearing to go freeform.
 */
export function ProductPicker({ selectedProduct, onSelect }: ProductPickerProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearch = useDebounce(search, 300);

  // Search for products when debounced search changes
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="flex items-center gap-3 min-w-0">
          {/* Product image or icon */}
          {selectedProduct.image_url || selectedProduct.image_asset_id ? (
            <img 
              src={selectedProduct.image_url || ''} 
              alt={selectedProduct.name}
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{selectedProduct.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {selectedProduct.brand}
              {selectedProduct.thc_percent && ` • ${selectedProduct.thc_percent}% THC`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="flex-shrink-0 ml-2">
          <X size={16} />
        </Button>
      </div>
    );
  }

  // No product selected - show search
  return (
    <div className="relative" ref={containerRef}>
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
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                type="button"
                className="w-full text-left p-3 hover:bg-accent transition-colors flex items-center gap-3"
                onClick={() => handleSelect(product)}
              >
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {product.brand} 
                    {product.product_type && ` • ${product.product_type}`}
                  </p>
                </div>
              </button>
            ))
          )}
          <div className="p-2 border-t">
            <Button
              type="button"
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

