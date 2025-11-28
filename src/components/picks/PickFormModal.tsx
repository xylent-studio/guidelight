import { useState, useEffect, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import { Plus, Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { createPick, updatePick } from '@/lib/api/picks';
import { picks as picksCopy } from '@/lib/copy';
import {
  CURATED_EFFECT_TAGS,
  MAX_EFFECT_TAGS,
  STRAIN_TYPES,
  INTENSITY_OPTIONS,
  DEAL_TYPES,
  DAYS_OF_WEEK,
  shouldShowField,
  isStrainTypeRelevant,
  isIntensityRelevant,
  isDealsCategory,
  getFormatOptions,
} from '@/lib/constants/effectTags';
import type { PickDraft } from '@/types/pickDraft';
import type { Database } from '@/types/database';

type Pick = Database['public']['Tables']['picks']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface PickFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: 'add' | 'edit';
  budtenderId: string;
  categoryId?: string;
  categoryName?: string;
  showCategorySelector?: boolean;
  categories?: Category[];
  editingPick?: Pick | null;
}

/**
 * Pick creation/editing modal with:
 * - Single draft state (no data loss on category switch)
 * - Category-conditional field rendering
 * - Curated effect tags (max 3) + unlimited custom tags
 * - Quick Info + Optional Details sections
 */
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
  const [showOptional, setShowOptional] = useState(false);
  const [showCategoryFields, setShowCategoryFields] = useState(false);
  const [customTag, setCustomTag] = useState('');

  // Single draft state object - all fields stored, conditionally rendered
  const [draft, setDraft] = useState<PickDraft>(() => createEmptyDraftInternal(initialCategoryId || ''));

  const shouldShowCategorySelector = showCategorySelector || mode === 'edit';
  const currentCategory = categories.find(c => c.id === draft.category_id);
  const currentCategoryName = currentCategory?.name || initialCategoryName || 'Pick';
  const isDeals = isDealsCategory(currentCategoryName);

  // Helper to create empty draft
  function createEmptyDraftInternal(categoryId: string): PickDraft {
    return {
      id: undefined,
      category_id: categoryId,
      product_name: '',
      brand: '',
      rating: 4,
      effect_tags: [],
      custom_tags: [],
      why_i_love_it: '',
      is_active: true,
      one_liner: '',
      strain_type: '',
      intensity: '',
      format: '',
      package_size: '',
      potency_summary: '',
      top_terpenes: '',
      is_infused: false,
      deal_title: '',
      deal_type: '',
      deal_value: '',
      deal_applies_to: '',
      deal_days: [],
      deal_fine_print: '',
      product_type: 'flower',
      time_of_day: 'Anytime',
    };
  }

  // Helper to convert pick to draft
  function convertPickToDraft(pick: Pick): PickDraft {
    return {
      id: pick.id,
      category_id: pick.category_id,
      product_name: pick.product_name,
      brand: pick.brand ?? '',
      rating: pick.rating,
      effect_tags: pick.effect_tags ?? [],
      custom_tags: pick.custom_tags ?? [],
      why_i_love_it: pick.why_i_love_it ?? '',
      is_active: pick.is_active,
      one_liner: pick.one_liner ?? '',
      strain_type: pick.strain_type ?? '',
      intensity: pick.intensity ?? '',
      format: pick.format ?? '',
      package_size: pick.package_size ?? '',
      potency_summary: pick.potency_summary ?? '',
      top_terpenes: pick.top_terpenes ?? '',
      is_infused: pick.is_infused ?? false,
      deal_title: pick.deal_title ?? '',
      deal_type: pick.deal_type ?? '',
      deal_value: pick.deal_value ?? '',
      deal_applies_to: pick.deal_applies_to ?? '',
      deal_days: pick.deal_days ?? [],
      deal_fine_print: pick.deal_fine_print ?? '',
      product_type: pick.product_type,
      time_of_day: pick.time_of_day,
    };
  }

  // Update draft field helper
  const updateDraft = useCallback((updates: Partial<PickDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && editingPick) {
        setDraft(convertPickToDraft(editingPick));
        // Auto-expand sections if there's content
        setShowOptional(!!(editingPick.why_i_love_it));
        setShowCategoryFields(!!(editingPick.format || editingPick.potency_summary || editingPick.deal_title));
      } else {
        setDraft(createEmptyDraftInternal(initialCategoryId || ''));
        setShowOptional(false);
        setShowCategoryFields(false);
      }
      setCustomTag('');
      setError(null);
    }
  }, [open, mode, editingPick, initialCategoryId]);

  function handleClose() {
    if (!saving) {
      onOpenChange(false);
    }
  }

  // Category change - only updates category_id, preserves all other fields
  function handleCategoryChange(newCategoryId: string) {
    updateDraft({ category_id: newCategoryId });
  }

  // Effect tags (curated, max 3)
  function handleToggleEffectTag(tag: string) {
    const current = draft.effect_tags;
    if (current.includes(tag)) {
      updateDraft({ effect_tags: current.filter(t => t !== tag) });
    } else if (current.length < MAX_EFFECT_TAGS) {
      updateDraft({ effect_tags: [...current, tag] });
    }
  }

  // Custom tags (unlimited)
  function handleAddCustomTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !draft.custom_tags.includes(trimmed)) {
      updateDraft({ custom_tags: [...draft.custom_tags, trimmed] });
    }
    setCustomTag('');
  }

  function handleRemoveCustomTag(tag: string) {
    updateDraft({ custom_tags: draft.custom_tags.filter(t => t !== tag) });
  }

  function handleCustomTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag(customTag);
    }
  }

  // Deal days toggle
  function handleToggleDealDay(day: string) {
    const current = draft.deal_days;
    if (current.includes(day)) {
      updateDraft({ deal_days: current.filter(d => d !== day) });
    } else {
      updateDraft({ deal_days: [...current, day] });
    }
  }

  async function handleSave() {
    // Validation
    if (!draft.product_name.trim()) {
      setError('Every pick needs a name. What product is this?');
      return;
    }

    if (!draft.category_id) {
      setError('Which category should this pick live in?');
      return;
    }

    // Deals-specific validation
    if (isDeals && !draft.deal_title.trim()) {
      setError('Deals need a title. What\'s the deal?');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const pickData = {
        budtender_id: budtenderId,
        category_id: draft.category_id,
        product_name: draft.product_name.trim(),
        brand: draft.brand.trim() || null,
        rating: draft.rating,
        effect_tags: draft.effect_tags.length > 0 ? draft.effect_tags : null,
        custom_tags: draft.custom_tags.length > 0 ? draft.custom_tags : null,
        why_i_love_it: draft.why_i_love_it.trim() || null,
        is_active: draft.is_active,
        one_liner: draft.one_liner.trim() || null,
        strain_type: draft.strain_type || null,
        intensity: draft.intensity || null,
        format: draft.format || null,
        package_size: draft.package_size.trim() || null,
        potency_summary: draft.potency_summary.trim() || null,
        top_terpenes: draft.top_terpenes.trim() || null,
        is_infused: draft.is_infused || null,
        deal_title: draft.deal_title.trim() || null,
        deal_type: draft.deal_type || null,
        deal_value: draft.deal_value.trim() || null,
        deal_applies_to: draft.deal_applies_to.trim() || null,
        deal_days: draft.deal_days.length > 0 ? draft.deal_days : null,
        deal_fine_print: draft.deal_fine_print.trim() || null,
        product_type: draft.product_type,
        time_of_day: draft.time_of_day,
      };

      if (mode === 'add') {
        await createPick(pickData);
      } else if (mode === 'edit' && editingPick) {
        await updatePick(editingPick.id, pickData, editingPick);
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

  const title = mode === 'add'
    ? (shouldShowCategorySelector ? 'Add New Pick' : `Add ${currentCategoryName} Pick`)
    : 'Edit Pick';

  const description = mode === 'add'
    ? 'Fill in the basics below. You can add more details anytime.'
    : 'Update your pick details.';

  // Get format options for current category
  const formatOptions = getFormatOptions(currentCategoryName);
  const showStrainType = isStrainTypeRelevant(currentCategoryName);
  const showIntensity = isIntensityRelevant(currentCategoryName);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* ========== QUICK INFO SECTION ========== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span>Quick info</span>
              <span className="text-xs text-muted-foreground font-normal">(required)</span>
            </div>

            {/* Category Selector */}
            {shouldShowCategorySelector && categories.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={draft.category_id}
                  onValueChange={handleCategoryChange}
                  disabled={saving}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Product Name / Deal Title */}
            <div className="space-y-1.5">
              <Label htmlFor="product-name" className="text-sm">
                {isDeals ? 'Deal Title' : 'Product Name'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                value={isDeals ? draft.deal_title : draft.product_name}
                onChange={(e) => updateDraft(isDeals ? { deal_title: e.target.value } : { product_name: e.target.value })}
                placeholder={isDeals ? "e.g., Buy 2 Get 1 Half-Oz Flower" : "e.g., Blue Dream, Kiva Camino..."}
                disabled={saving}
              />
            </div>

            {/* Brand (not for Deals) */}
            {!isDeals && (
              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-sm">Brand</Label>
                <Input
                  id="brand"
                  value={draft.brand}
                  onChange={(e) => updateDraft({ brand: e.target.value })}
                  placeholder="e.g., Pacific Stone, Stiiizy..."
                  disabled={saving}
                />
              </div>
            )}

            {/* One-liner */}
            <div className="space-y-1.5">
              <Label htmlFor="one-liner" className="text-sm">
                {isDeals ? 'Deal Summary' : 'One-liner'}
              </Label>
              <Input
                id="one-liner"
                value={isDeals ? draft.product_name : draft.one_liner}
                onChange={(e) => updateDraft(isDeals ? { product_name: e.target.value } : { one_liner: e.target.value })}
                placeholder={isDeals ? "e.g., Buy 2 carts, get the 3rd 50% off" : "Short headline for display"}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                {isDeals ? 'Guest-facing description of the deal' : 'Appears on your pick cards'}
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <Label className="text-sm">{isDeals ? 'How good is this deal?' : 'Your Rating'}</Label>
              <div className="flex items-center gap-3">
                <StarRating
                  value={draft.rating}
                  onChange={(rating) => updateDraft({ rating })}
                  size={24}
                />
                <span className="text-sm text-muted-foreground">
                  {draft.rating ? `${draft.rating} star${draft.rating !== 1 ? 's' : ''}` : 'Not rated'}
                </span>
              </div>
            </div>

            {/* Effect Tags (curated, max 3) */}
            <div className="space-y-2">
              <Label className="text-sm">
                Effect Tags
                <span className="text-xs text-muted-foreground ml-2">
                  ({draft.effect_tags.length}/{MAX_EFFECT_TAGS} selected)
                </span>
              </Label>
              
              {/* Selected effect tags */}
              {draft.effect_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {draft.effect_tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="pl-2 pr-1 py-1 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleToggleEffectTag(tag)}
                        className="hover:bg-primary-foreground/20 rounded p-0.5"
                        disabled={saving}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Curated effect tags */}
              <div className="flex flex-wrap gap-1.5">
                {CURATED_EFFECT_TAGS
                  .filter(tag => !draft.effect_tags.includes(tag))
                  .slice(0, 12)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleEffectTag(tag)}
                      disabled={saving || draft.effect_tags.length >= MAX_EFFECT_TAGS}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        draft.effect_tags.length >= MAX_EFFECT_TAGS
                          ? 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      }`}
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>

            {/* Custom Tags (unlimited) */}
            <div className="space-y-2">
              <Label className="text-sm">Custom Tags</Label>
              
              {/* Selected custom tags */}
              {draft.custom_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {draft.custom_tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTag(tag)}
                        className="hover:bg-muted-foreground/20 rounded p-0.5"
                        disabled={saving}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={handleCustomTagKeyDown}
                placeholder="e.g., Bills game, Date night... (press Enter)"
                disabled={saving}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Fun/seasonal tags like "420 special", "Snow day", etc.
              </p>
            </div>
          </div>

          {/* ========== CATEGORY-SPECIFIC SECTION ========== */}
          {(formatOptions.length > 0 || showStrainType || isDeals) && (
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowCategoryFields(!showCategoryFields)}
                className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{isDeals ? 'Deal details' : `${currentCategoryName} details`}</span>
                {showCategoryFields ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showCategoryFields && (
                <div className="space-y-4 pt-4">
                  {/* Deals-specific fields */}
                  {isDeals && (
                    <>
                      {/* Deal Type */}
                      <div className="space-y-1.5">
                        <Label htmlFor="deal-type" className="text-sm">Deal Type</Label>
                        <Select
                          value={draft.deal_type}
                          onValueChange={(value) => updateDraft({ deal_type: value })}
                          disabled={saving}
                        >
                          <SelectTrigger id="deal-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEAL_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Deal Value */}
                      <div className="space-y-1.5">
                        <Label htmlFor="deal-value" className="text-sm">Deal Value</Label>
                        <Input
                          id="deal-value"
                          value={draft.deal_value}
                          onChange={(e) => updateDraft({ deal_value: e.target.value })}
                          placeholder="e.g., 25% off, $10 off, 3rd 50% off"
                          disabled={saving}
                        />
                      </div>

                      {/* Applies To */}
                      <div className="space-y-1.5">
                        <Label htmlFor="deal-applies" className="text-sm">Applies To</Label>
                        <Input
                          id="deal-applies"
                          value={draft.deal_applies_to}
                          onChange={(e) => updateDraft({ deal_applies_to: e.target.value })}
                          placeholder="e.g., All Vapes, Kiva brand, specific products"
                          disabled={saving}
                        />
                      </div>

                      {/* Days of Week */}
                      <div className="space-y-1.5">
                        <Label className="text-sm">Days Available</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleToggleDealDay(day)}
                              disabled={saving}
                              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                draft.deal_days.includes(day)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {draft.deal_days.length === 0 ? 'Leave blank for every day' : `Active on: ${draft.deal_days.join(', ')}`}
                        </p>
                      </div>

                      {/* Fine Print */}
                      <div className="space-y-1.5">
                        <Label htmlFor="deal-fine-print" className="text-sm">Fine Print</Label>
                        <Input
                          id="deal-fine-print"
                          value={draft.deal_fine_print}
                          onChange={(e) => updateDraft({ deal_fine_print: e.target.value })}
                          placeholder="e.g., Limit 1 per guest, Cannot combine"
                          disabled={saving}
                        />
                      </div>
                    </>
                  )}

                  {/* Non-deal category fields */}
                  {!isDeals && (
                    <>
                      {/* Strain Type */}
                      {showStrainType && (
                        <div className="space-y-1.5">
                          <Label htmlFor="strain-type" className="text-sm">Strain Type</Label>
                          <Select
                            value={draft.strain_type}
                            onValueChange={(value) => updateDraft({ strain_type: value })}
                            disabled={saving}
                          >
                            <SelectTrigger id="strain-type">
                              <SelectValue placeholder="Select strain type" />
                            </SelectTrigger>
                            <SelectContent>
                              {STRAIN_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Format */}
                      {formatOptions.length > 0 && (
                        <div className="space-y-1.5">
                          <Label htmlFor="format" className="text-sm">Format</Label>
                          <Select
                            value={draft.format}
                            onValueChange={(value) => updateDraft({ format: value })}
                            disabled={saving}
                          >
                            <SelectTrigger id="format">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              {formatOptions.map((opt) => (
                                <SelectItem key={opt} value={opt.toLowerCase()}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Package Size */}
                      {shouldShowField('package_size', currentCategoryName) && (
                        <div className="space-y-1.5">
                          <Label htmlFor="package-size" className="text-sm">Package Size</Label>
                          <Input
                            id="package-size"
                            value={draft.package_size}
                            onChange={(e) => updateDraft({ package_size: e.target.value })}
                            placeholder="e.g., 3.5g, 5-pack, 1g cart"
                            disabled={saving}
                          />
                        </div>
                      )}

                      {/* Potency Summary */}
                      {shouldShowField('potency_summary', currentCategoryName) && (
                        <div className="space-y-1.5">
                          <Label htmlFor="potency" className="text-sm">Potency</Label>
                          <Input
                            id="potency"
                            value={draft.potency_summary}
                            onChange={(e) => updateDraft({ potency_summary: e.target.value })}
                            placeholder="e.g., THC 27%, CBD <1%"
                            disabled={saving}
                          />
                        </div>
                      )}

                      {/* Top Terpenes */}
                      {shouldShowField('top_terpenes', currentCategoryName) && (
                        <div className="space-y-1.5">
                          <Label htmlFor="terpenes" className="text-sm">Top Terpenes</Label>
                          <Input
                            id="terpenes"
                            value={draft.top_terpenes}
                            onChange={(e) => updateDraft({ top_terpenes: e.target.value })}
                            placeholder="e.g., Limonene, Myrcene, Caryophyllene"
                            disabled={saving}
                          />
                        </div>
                      )}

                      {/* Is Infused (Pre-rolls) */}
                      {shouldShowField('is_infused', currentCategoryName) && (
                        <div className="flex items-center gap-3">
                          <Switch
                            id="is-infused"
                            checked={draft.is_infused}
                            onCheckedChange={(checked) => updateDraft({ is_infused: checked })}
                            disabled={saving}
                          />
                          <Label htmlFor="is-infused" className="text-sm cursor-pointer">
                            Infused product
                          </Label>
                        </div>
                      )}

                      {/* Intensity */}
                      {showIntensity && (
                        <div className="space-y-1.5">
                          <Label htmlFor="intensity" className="text-sm">Intensity</Label>
                          <Select
                            value={draft.intensity}
                            onValueChange={(value) => updateDraft({ intensity: value })}
                            disabled={saving}
                          >
                            <SelectTrigger id="intensity">
                              <SelectValue placeholder="How strong?" />
                            </SelectTrigger>
                            <SelectContent>
                              {INTENSITY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <span>{opt.label}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    — {opt.description}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========== OPTIONAL DETAILS SECTION ========== */}
          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Optional details</span>
              {showOptional ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showOptional && (
              <div className="space-y-4 pt-4">
                {/* Notes (Why I Love It) */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-sm">
                    {isDeals ? 'Why this deal is great' : 'Why I love it'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={draft.why_i_love_it}
                    onChange={(e) => updateDraft({ why_i_love_it: e.target.value })}
                    placeholder={isDeals 
                      ? "What makes this deal stand out?" 
                      : "What makes this one special? Your personal take, not the menu description."
                    }
                    rows={3}
                    disabled={saving}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown to customers on your picks cards.
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <Switch
                    id="is-active"
                    checked={draft.is_active}
                    onCheckedChange={(checked) => updateDraft({ is_active: checked })}
                    disabled={saving}
                  />
                  <div>
                    <Label htmlFor="is-active" className="text-sm cursor-pointer">
                      Show to customers
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {draft.is_active ? 'Visible in your picks.' : 'Hidden — only you can see it.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
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
                {isDeals ? 'Add Deal' : 'Add Pick'}
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
