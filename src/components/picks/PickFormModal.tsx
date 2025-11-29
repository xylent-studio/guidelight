import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Send, ChevronDown, ChevronUp, X, Trash2 } from 'lucide-react';
import { createPick, updatePick } from '@/lib/api/picks';
import { deleteDraftForPick, type PickDraftRow } from '@/lib/api/drafts';
import { getProductById, type Product } from '@/lib/api/products';
import { getAssetById, type MediaAsset } from '@/lib/api/assets';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { FieldVisibilityToggle } from './FieldVisibilityToggle';
import { ProductPicker } from './ProductPicker';
import { PickImageSection } from './PickImageSection';
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
import {
  isFieldVisible,
  toggleFieldInArray,
  type ToggleableFieldKey,
} from '@/lib/constants/visibleFields';
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
  /** Existing draft to resume (from pick_drafts table) */
  initialDraft?: PickDraftRow | null;
  /** Called after successful publish (alias for onSuccess for clarity) */
  onPublished?: () => void;
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
  initialDraft,
  onPublished,
}: PickFormModalProps) {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);
  const [showCategoryFields, setShowCategoryFields] = useState(false);
  const [customTag, setCustomTag] = useState('');
  
  // Product link and image state (separate from draft since stored directly on pick)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customImage, setCustomImage] = useState<MediaAsset | null>(null);

  // Single draft state object - all fields stored, conditionally rendered
  const [formData, setFormData] = useState<PickDraft>(() => {
    // Priority: initialDraft.data > editingPick > empty draft
    if (initialDraft?.data) {
      return initialDraft.data as unknown as PickDraft;
    }
    if (editingPick) {
      return convertPickToDraft(editingPick);
    }
    return createEmptyDraftInternal(initialCategoryId || '');
  });

  // Track if autosave should be active (only when modal is open)
  const isAutosaveActive = useRef(false);

  // Hook up autosave to pick_drafts table
  const {
    saveStatus,
    updateDraft: triggerAutosave,
    discardDraft,
    // isDirty available for future use (e.g., close confirmation)
  } = useDraftAutosave({
    userId: budtenderId,
    pickId: editingPick?.id,
    initialDraft: initialDraft || undefined,
  });

  // Sync form changes to autosave (debounced)
  useEffect(() => {
    if (open && isAutosaveActive.current) {
      triggerAutosave(formData as unknown as Record<string, unknown>);
    }
  }, [formData, open, triggerAutosave]);

  // Alias for backward compatibility
  const draft = formData;

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
      visible_fields: [],
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
      visible_fields: pick.visible_fields ?? [],
    };
  }

  // Update form field helper
  const updateFormField = useCallback((updates: Partial<PickDraft>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      // Priority: initialDraft.data > editingPick > empty draft
      if (initialDraft?.data) {
        const draftData = initialDraft.data as unknown as PickDraft;
        setFormData(draftData);
        setShowOptional(!!draftData.why_i_love_it);
        setShowCategoryFields(!!(draftData.format || draftData.potency_summary || draftData.deal_title));
      } else if (mode === 'edit' && editingPick) {
        setFormData(convertPickToDraft(editingPick));
        setShowOptional(!!(editingPick.why_i_love_it));
        setShowCategoryFields(!!(editingPick.format || editingPick.potency_summary || editingPick.deal_title));
      } else {
        setFormData(createEmptyDraftInternal(initialCategoryId || ''));
        setShowOptional(false);
        setShowCategoryFields(false);
      }
      setCustomTag('');
      setError(null);
      // Reset product and image on open
      setSelectedProduct(null);
      setCustomImage(null);
      // Enable autosave after initial form setup
      isAutosaveActive.current = true;
    } else {
      // Disable autosave when modal closes
      isAutosaveActive.current = false;
    }
  }, [open, mode, editingPick, initialCategoryId, initialDraft]);

  // Load product and image when editing a pick that has them
  useEffect(() => {
    async function loadProductAndImage() {
      if (!open || mode !== 'edit' || !editingPick) return;
      
      // Load linked product
      if (editingPick.product_id) {
        const product = await getProductById(editingPick.product_id);
        setSelectedProduct(product);
      }
      
      // Load custom image
      if (editingPick.image_asset_id) {
        const asset = await getAssetById(editingPick.image_asset_id);
        setCustomImage(asset);
      }
    }
    
    loadProductAndImage();
  }, [open, mode, editingPick]);

  function handleClose() {
    if (!publishing) {
      // Draft is autosaved, safe to close
      onOpenChange(false);
    }
  }

  // Category change - only updates category_id, preserves all other fields
  function handleCategoryChange(newCategoryId: string) {
    updateFormField({ category_id: newCategoryId });
  }

  // Product selection - auto-fill fields from product catalog
  function handleProductSelect(product: Product | null) {
    setSelectedProduct(product);
    
    if (product) {
      // Auto-fill fields from product
      updateFormField({
        product_name: product.name,
        brand: product.brand || '',
        // Only update category if product has one and we allow category changes
        ...(product.category_id && shouldShowCategorySelector ? { category_id: product.category_id } : {}),
        // Potency info
        potency_summary: [
          product.thc_percent ? `THC ${product.thc_percent}%` : '',
          product.cbd_percent ? `CBD ${product.cbd_percent}%` : '',
        ].filter(Boolean).join(', ') || '',
        // Strain info
        strain_type: product.strain_type || '',
        // Product type/format
        format: product.product_type || '',
      });
    }
  }

  // Toggle field visibility for customers
  function handleToggleVisibility(fieldKey: ToggleableFieldKey) {
    const newFields = toggleFieldInArray(fieldKey, draft.visible_fields);
    updateFormField({ visible_fields: newFields });
  }

  // Effect tags (curated, max 3)
  function handleToggleEffectTag(tag: string) {
    const current = draft.effect_tags;
    if (current.includes(tag)) {
      updateFormField({ effect_tags: current.filter(t => t !== tag) });
    } else if (current.length < MAX_EFFECT_TAGS) {
      updateFormField({ effect_tags: [...current, tag] });
    }
  }

  // Custom tags (unlimited)
  function handleAddCustomTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !draft.custom_tags.includes(trimmed)) {
      updateFormField({ custom_tags: [...draft.custom_tags, trimmed] });
    }
    setCustomTag('');
  }

  function handleRemoveCustomTag(tag: string) {
    updateFormField({ custom_tags: draft.custom_tags.filter(t => t !== tag) });
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
      updateFormField({ deal_days: current.filter(d => d !== day) });
    } else {
      updateFormField({ deal_days: [...current, day] });
    }
  }

  /**
   * Publish pick to the picks table and delete the draft
   */
  async function handlePublish() {
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
    setPublishing(true);

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
        visible_fields: draft.visible_fields.length > 0 ? draft.visible_fields : null,
        // Product link and custom image
        product_id: selectedProduct?.id || null,
        image_asset_id: customImage?.id || null,
      };

      if (mode === 'add') {
        await createPick(pickData);
        // Delete the draft after successful creation
        await discardDraft();
      } else if (mode === 'edit' && editingPick) {
        await updatePick(editingPick.id, pickData, editingPick);
        // Delete draft for this pick
        await deleteDraftForPick(editingPick.id);
      }

      // Call both callbacks for flexibility
      onSuccess();
      onPublished?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error publishing pick:', err);
      setError(err instanceof Error ? err.message : picksCopy.saveError);
    } finally {
      setPublishing(false);
    }
  }

  /**
   * Discard the draft and close the modal
   */
  async function handleDiscard() {
    await discardDraft();
    onOpenChange(false);
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
          {/* ========== PRODUCT & IMAGE SECTION ========== */}
          {!isDeals && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Product (optional)</Label>
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
          )}

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
                  disabled={publishing}
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
                onChange={(e) => updateFormField(isDeals ? { deal_title: e.target.value } : { product_name: e.target.value })}
                placeholder={isDeals ? "e.g., Buy 2 Get 1 Half-Oz Flower" : "e.g., Blue Dream, Kiva Camino..."}
                disabled={publishing}
              />
            </div>

            {/* Brand (not for Deals) */}
            {!isDeals && (
              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-sm">Brand</Label>
                <Input
                  id="brand"
                  value={draft.brand}
                  onChange={(e) => updateFormField({ brand: e.target.value })}
                  placeholder="e.g., Pacific Stone, Stiiizy..."
                  disabled={publishing}
                />
              </div>
            )}

            {/* One-liner */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="one-liner" className="text-sm">
                  {isDeals ? 'Deal Summary' : 'One-liner'}
                </Label>
                {!isDeals && (
                  <FieldVisibilityToggle
                    isVisible={isFieldVisible('one_liner', draft.visible_fields)}
                    onToggle={() => handleToggleVisibility('one_liner')}
                    disabled={publishing}
                  />
                )}
              </div>
              <Input
                id="one-liner"
                value={isDeals ? draft.product_name : draft.one_liner}
                onChange={(e) => updateFormField(isDeals ? { product_name: e.target.value } : { one_liner: e.target.value })}
                placeholder={isDeals ? "e.g., Buy 2 carts, get the 3rd 50% off" : "Short headline for display"}
                disabled={publishing}
              />
              <p className="text-xs text-muted-foreground">
                {isDeals ? 'Guest-facing description of the deal' : 'Appears on your pick cards'}
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm">{isDeals ? 'How good is this deal?' : 'Your Rating'}</Label>
                <FieldVisibilityToggle
                  isVisible={isFieldVisible('rating', draft.visible_fields)}
                  onToggle={() => handleToggleVisibility('rating')}
                  disabled={publishing}
                />
              </div>
              <div className="flex items-center gap-3">
                <StarRating
                  value={draft.rating}
                  onChange={(rating) => updateFormField({ rating })}
                  size={24}
                />
                <span className="text-sm text-muted-foreground">
                  {draft.rating ? `${draft.rating} star${draft.rating !== 1 ? 's' : ''}` : 'Not rated'}
                </span>
              </div>
            </div>

            {/* Effect Tags (curated, max 3) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">
                  Effect Tags
                  <span className="text-xs text-muted-foreground ml-2">
                    ({draft.effect_tags.length}/{MAX_EFFECT_TAGS} selected)
                  </span>
                </Label>
                <FieldVisibilityToggle
                  isVisible={isFieldVisible('effect_tags', draft.visible_fields)}
                  onToggle={() => handleToggleVisibility('effect_tags')}
                  disabled={publishing}
                />
              </div>
              
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
                        disabled={publishing}
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
                      disabled={publishing || draft.effect_tags.length >= MAX_EFFECT_TAGS}
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
                        disabled={publishing}
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
                disabled={publishing}
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
                          onValueChange={(value) => updateFormField({ deal_type: value })}
                          disabled={publishing}
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
                          onChange={(e) => updateFormField({ deal_value: e.target.value })}
                          placeholder="e.g., 25% off, $10 off, 3rd 50% off"
                          disabled={publishing}
                        />
                      </div>

                      {/* Applies To */}
                      <div className="space-y-1.5">
                        <Label htmlFor="deal-applies" className="text-sm">Applies To</Label>
                        <Input
                          id="deal-applies"
                          value={draft.deal_applies_to}
                          onChange={(e) => updateFormField({ deal_applies_to: e.target.value })}
                          placeholder="e.g., All Vapes, Kiva brand, specific products"
                          disabled={publishing}
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
                              disabled={publishing}
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
                          onChange={(e) => updateFormField({ deal_fine_print: e.target.value })}
                          placeholder="e.g., Limit 1 per guest, Cannot combine"
                          disabled={publishing}
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
                            onValueChange={(value) => updateFormField({ strain_type: value })}
                            disabled={publishing}
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
                            onValueChange={(value) => updateFormField({ format: value })}
                            disabled={publishing}
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
                            onChange={(e) => updateFormField({ package_size: e.target.value })}
                            placeholder="e.g., 3.5g, 5-pack, 1g cart"
                            disabled={publishing}
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
                            onChange={(e) => updateFormField({ potency_summary: e.target.value })}
                            placeholder="e.g., THC 27%, CBD <1%"
                            disabled={publishing}
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
                            onChange={(e) => updateFormField({ top_terpenes: e.target.value })}
                            placeholder="e.g., Limonene, Myrcene, Caryophyllene"
                            disabled={publishing}
                          />
                        </div>
                      )}

                      {/* Is Infused (Pre-rolls) */}
                      {shouldShowField('is_infused', currentCategoryName) && (
                        <div className="flex items-center gap-3">
                          <Switch
                            id="is-infused"
                            checked={draft.is_infused}
                            onCheckedChange={(checked) => updateFormField({ is_infused: checked })}
                            disabled={publishing}
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
                            onValueChange={(value) => updateFormField({ intensity: value })}
                            disabled={publishing}
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
                  <div className="flex items-center gap-2">
                    <Label htmlFor="notes" className="text-sm">
                      {isDeals ? 'Why this deal is great' : 'Why I love it'}
                    </Label>
                    <FieldVisibilityToggle
                      isVisible={isFieldVisible('why_i_love_it', draft.visible_fields)}
                      onToggle={() => handleToggleVisibility('why_i_love_it')}
                      disabled={publishing}
                    />
                  </div>
                  <Textarea
                    id="notes"
                    value={draft.why_i_love_it}
                    onChange={(e) => updateFormField({ why_i_love_it: e.target.value })}
                    placeholder={isDeals 
                      ? "What makes this deal stand out?" 
                      : "What makes this one special? Your personal take, not the menu description."
                    }
                    rows={3}
                    disabled={publishing}
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
                    onCheckedChange={(checked) => updateFormField({ is_active: checked })}
                    disabled={publishing}
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

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={handleDiscard} 
              disabled={publishing}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={14} className="mr-1.5" />
              Discard
            </Button>
            <SaveStatusIndicator status={saveStatus} />
          </div>
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? (
              'Publishing...'
            ) : (
              <>
                <Send size={16} className="mr-1.5" />
                {mode === 'add' 
                  ? (isDeals ? 'Publish Deal' : 'Publish Pick')
                  : 'Publish Changes'
                }
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
