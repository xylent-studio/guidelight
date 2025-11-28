/**
 * PickDraft - Single state object for pick creation/editing
 * 
 * This type holds all possible fields for a pick. Category-specific fields
 * are always stored but only rendered when relevant to the selected category.
 * This enables safe category switching without data loss.
 * 
 * @see notes/251128_guidelight_ux_overhual/ai-dev/06_PICKS_AND_LAB_INFO_MODEL.md
 */

export interface PickDraft {
  // Identification (set when editing)
  id?: string;
  
  // Required fields
  category_id: string;
  product_name: string;
  
  // Core fields (always shown)
  brand: string;
  rating: number | null;
  effect_tags: string[];
  custom_tags: string[];
  why_i_love_it: string;
  is_active: boolean;
  
  // Shared optional fields
  one_liner: string;
  strain_type: string;
  intensity: string;
  
  // Category-specific fields (stored always, rendered conditionally)
  format: string;
  package_size: string;
  potency_summary: string;
  top_terpenes: string;
  is_infused: boolean;
  
  // Deal-specific fields
  deal_title: string;
  deal_type: string;
  deal_value: string;
  deal_applies_to: string;
  deal_days: string[];
  deal_fine_print: string;
  
  // Legacy fields (preserved for backward compatibility)
  product_type: string;
  time_of_day: string;
}

/**
 * Create an empty draft with sensible defaults
 */
export function createEmptyDraft(categoryId: string = ''): PickDraft {
  return {
    id: undefined,
    category_id: categoryId,
    product_name: '',
    brand: '',
    rating: 4, // Default to 4 stars for new picks
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
    // Legacy defaults
    product_type: 'flower',
    time_of_day: 'Anytime',
  };
}

/**
 * Convert a database Pick row to a PickDraft for editing
 */
export function pickToDraft(pick: {
  id: string;
  category_id: string;
  product_name: string;
  brand: string | null;
  rating: number | null;
  effect_tags: string[] | null;
  custom_tags: string[] | null;
  why_i_love_it: string | null;
  is_active: boolean;
  one_liner: string | null;
  strain_type: string | null;
  intensity: string | null;
  format: string | null;
  package_size: string | null;
  potency_summary: string | null;
  top_terpenes: string | null;
  is_infused: boolean | null;
  deal_title: string | null;
  deal_type: string | null;
  deal_value: string | null;
  deal_applies_to: string | null;
  deal_days: string[] | null;
  deal_fine_print: string | null;
  product_type: string;
  time_of_day: string;
}): PickDraft {
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

/**
 * Convert a PickDraft to database insert/update format
 */
export function draftToPickData(draft: PickDraft, budtenderId: string) {
  return {
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
    // Legacy fields
    product_type: draft.product_type,
    time_of_day: draft.time_of_day,
  };
}

