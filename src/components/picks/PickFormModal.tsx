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
import { createPick, updatePick } from '@/lib/api/picks';
import type { Database } from '@/types/database';

type Pick = Database['public']['Tables']['picks']['Row'];
type PickInsert = Database['public']['Tables']['picks']['Insert'];

interface PickFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  categoryId: string;
  categoryName: string;
  budtenderId: string;
  editingPick?: Pick | null;
}

export function PickFormModal({
  open,
  onOpenChange,
  onSuccess,
  mode,
  categoryId,
  categoryName,
  budtenderId,
  editingPick,
}: PickFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [productType, setProductType] = useState('flower');
  const [timeOfDay, setTimeOfDay] = useState('Anytime');
  const [whyILoveIt, setWhyILoveIt] = useState('');
  const [rank, setRank] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Reset form when modal opens or editingPick changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && editingPick) {
        setProductName(editingPick.product_name);
        setBrand(editingPick.brand || '');
        setProductType(editingPick.product_type);
        setTimeOfDay(editingPick.time_of_day || 'Anytime');
        setWhyILoveIt(editingPick.why_i_love_it || '');
        setRank(editingPick.rank);
        setIsActive(editingPick.is_active);
      } else {
        // Reset to defaults for add mode
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
  }, [open, mode, editingPick]);

  function handleClose() {
    if (!saving) {
      onOpenChange(false);
    }
  }

  async function handleSave() {
    // Validation
    if (!productName.trim()) {
      setError('Product name is required');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const pickData: Partial<PickInsert> = {
        budtender_id: budtenderId,
        category_id: categoryId,
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
      setError(err instanceof Error ? err.message : 'Failed to save pick. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const title = mode === 'add' 
    ? `Add New Pick — ${categoryName}` 
    : `Edit Pick — ${categoryName}`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Add a new product recommendation to this category.'
              : 'Update the details for this pick.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                placeholder="e.g., Blue Dream"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Pacific Stone"
                disabled={saving}
              />
            </div>
          </div>

          {/* Product Type & Time of Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-type">
                Product Type <span className="text-red-600">*</span>
              </Label>
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
              <Label htmlFor="time-of-day">Time of Day</Label>
              <Select
                value={timeOfDay}
                onValueChange={setTimeOfDay}
                disabled={saving}
              >
                <SelectTrigger id="time-of-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                  <SelectItem value="Anytime">Anytime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Why I Love It */}
          <div className="space-y-2">
            <Label htmlFor="why-i-love-it">Why I Love It</Label>
            <Textarea
              id="why-i-love-it"
              value={whyILoveIt}
              onChange={(e) => setWhyILoveIt(e.target.value)}
              placeholder="Share your personal take on this product..."
              rows={3}
              disabled={saving}
              className="resize-none"
            />
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="rank">Rank (Sort Order)</Label>
            <Input
              id="rank"
              type="number"
              min="1"
              max="10"
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 1)}
              disabled={saving}
              className="w-32"
            />
            <p className="text-xs text-text-muted">
              Lower numbers appear first within the category.
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={saving}
            />
            <Label htmlFor="is-active" className="text-sm text-text-muted cursor-pointer">
              Active (visible to customers)
            </Label>
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
            {saving 
              ? 'Saving...' 
              : mode === 'add' ? 'Add Pick' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

