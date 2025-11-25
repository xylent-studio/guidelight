import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check } from 'lucide-react';
import { createPick, updatePick } from '@/lib/api/picks';
import { picks as picksCopy } from '@/lib/copy';
import type { Database } from '@/types/database';

type Pick = Database['public']['Tables']['picks']['Row'];
type PickInsert = Database['public']['Tables']['picks']['Insert'];
type Category = Database['public']['Tables']['categories']['Row'];

interface PickFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  budtenderId: string;
  // Category can be pre-set (from category-specific button) or selectable
  categoryId?: string;
  categoryName?: string;
  // When true, shows category dropdown (for general add or edit)
  showCategorySelector?: boolean;
  // List of categories for the selector
  categories?: Category[];
  editingPick?: Pick | null;
}

export function PickFormModal({
  open,
  onOpenChange,
  onSuccess,
  mode,
  budtenderId,
  categoryId: initialCategoryId,
  categoryName: initialCategoryName,
  showCategorySelector = false,
  categories = [],
  editingPick,
}: PickFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId || '');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [productType, setProductType] = useState('flower');
  const [timeOfDay, setTimeOfDay] = useState('Anytime');
  const [whyILoveIt, setWhyILoveIt] = useState('');
  const [rank, setRank] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Determine if category selector should be shown
  // Show it when explicitly requested OR when editing (so user can move picks between categories)
  const shouldShowCategorySelector = showCategorySelector || mode === 'edit';

  // Get the display name for the current category
  const currentCategoryName = categories.find(c => c.id === selectedCategoryId)?.name 
    || initialCategoryName 
    || 'Pick';

  // Reset form when modal opens or editingPick changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && editingPick) {
        setSelectedCategoryId(editingPick.category_id);
        setProductName(editingPick.product_name);
        setBrand(editingPick.brand || '');
        setProductType(editingPick.product_type);
        setTimeOfDay(editingPick.time_of_day || 'Anytime');
        setWhyILoveIt(editingPick.why_i_love_it || '');
        setRank(editingPick.rank);
        setIsActive(editingPick.is_active);
      } else {
        // Reset to defaults for add mode
        setSelectedCategoryId(initialCategoryId || '');
        setProductName('');
        setBrand('');
        setProductType('flower');
        setTimeOfDay('Anytime');
        setWhyILoveIt('');
        setRank(1);
        setIsActive(true);
      }
      setError(null);
    }
  }, [open, mode, editingPick, initialCategoryId]);

  function handleClose() {
    if (!saving) {
      onOpenChange(false);
    }
  }

  async function handleSave() {
    // Validation
    if (!productName.trim()) {
      setError('Oops! Every pick needs a name. What product is this?');
      return;
    }

    if (!selectedCategoryId) {
      setError('Which category should this pick live in?');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const pickData: Partial<PickInsert> = {
        budtender_id: budtenderId,
        category_id: selectedCategoryId,
        product_name: productName.trim(),
        brand: brand.trim() || null,
        product_type: productType,
        time_of_day: timeOfDay,
        why_i_love_it: whyILoveIt.trim() || null,
        rank,
        is_active: isActive,
      };

      if (mode === 'add') {
        await createPick(pickData as PickInsert);
      } else if (mode === 'edit' && editingPick) {
        await updatePick(editingPick.id, pickData);
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving pick:', err);
      setError(err instanceof Error ? err.message : picksCopy.saveError);
    } finally {
      setSaving(false);
    }
  }

  // Build the title based on mode and whether category is pre-selected
  const title = mode === 'add'
    ? (shouldShowCategorySelector ? 'Add New Pick' : `Add ${currentCategoryName} Pick`)
    : `Edit Pick`;

  const description = mode === 'add'
    ? (shouldShowCategorySelector 
        ? 'Got a product you love? Add it to your picks so guests can see what you recommend.'
        : `Adding a new recommendation to your ${currentCategoryName} picks.`)
    : 'Update the details or move this pick to a different category.';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Selector - shown for general add or edit mode */}
          {shouldShowCategorySelector && categories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-600">*</span>
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                disabled={saving}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Where does this pick belong?" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-text-muted">
                {mode === 'edit' 
                  ? 'You can move this pick to a different category if needed.'
                  : 'Which section should this product live in?'}
              </p>
            </div>
          )}

          {/* Product Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">
                Product Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Blue Dream, Kiva Camino..."
                disabled={saving}
              />
              <p className="text-xs text-text-muted">
                What's on the label? Include strain name for flower.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Pacific Stone, Stiiizy..."
                disabled={saving}
              />
              <p className="text-xs text-text-muted">
                Who makes it? Helps guests find it on the menu.
              </p>
            </div>
          </div>

          {/* Product Type & Time of Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-type">Product Type</Label>
              <Select
                value={productType}
                onValueChange={setProductType}
                disabled={saving}
              >
                <SelectTrigger id="product-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flower">Flower</SelectItem>
                  <SelectItem value="pre_roll">Pre-roll</SelectItem>
                  <SelectItem value="vape">Vape</SelectItem>
                  <SelectItem value="edible">Edible</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="concentrate">Concentrate</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="topical">Topical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-of-day">Best For</Label>
              <Select
                value={timeOfDay}
                onValueChange={setTimeOfDay}
                disabled={saving}
              >
                <SelectTrigger id="time-of-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Daytime vibes</SelectItem>
                  <SelectItem value="Evening">Evening wind-down</SelectItem>
                  <SelectItem value="Night">Nighttime / Sleep</SelectItem>
                  <SelectItem value="Anytime">Anytime, really</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-text-muted">
                When do you usually reach for this one?
              </p>
            </div>
          </div>

          {/* Why I Love It */}
          <div className="space-y-2">
            <Label htmlFor="why-i-love-it">Why I Love It</Label>
            <Textarea
              id="why-i-love-it"
              value={whyILoveIt}
              onChange={(e) => setWhyILoveIt(e.target.value)}
              placeholder="What makes this one special? How does it make you feel? When do you recommend it?"
              rows={3}
              disabled={saving}
              className="resize-none"
            />
            <p className="text-xs text-text-muted">
              This is what guests really want to know — your personal take, not the menu description.
            </p>
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="rank">Priority</Label>
            <Input
              id="rank"
              type="number"
              min="1"
              max="10"
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 1)}
              disabled={saving}
              className="w-24"
            />
            <p className="text-xs text-text-muted">
              Lower = higher priority. Your #1 pick should be rank 1.
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 pt-2 pb-1">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={saving}
            />
            <div>
              <Label htmlFor="is-active" className="text-sm cursor-pointer">
                Show to guests
              </Label>
              <p className="text-xs text-text-muted">
                {isActive 
                  ? 'This pick will appear in Customer View.' 
                  : 'Hidden for now — only you can see it.'}
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              'Saving...'
            ) : mode === 'add' ? (
              <>
                <Plus size={16} className="mr-1.5" />
                Add Pick
              </>
            ) : (
              <>
                <Check size={16} className="mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
