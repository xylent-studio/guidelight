/**
 * Curated effect tags based on AIQ/Dispense industry patterns
 * Limited to 3 selections per pick for focused recommendations
 * 
 * @see notes/251128_guidelight_ux_overhual/ai-dev/06_PICKS_AND_LAB_INFO_MODEL.md
 */

// Curated effect tags - industry standard terms from AIQ/Dispense menus
export const CURATED_EFFECT_TAGS = [
  // Mood/feeling states
  'Relaxed',
  'Calm', 
  'Sleepy',
  'Happy',
  'Euphoric',
  'Uplifted',
  'Energetic',
  'Focused',
  'Creative',
  'Social',
  'Giggly',
  
  // Functional/therapeutic
  'Pain Relief',
  'Stress Relief',
  'Body High',
  'Head High',
  'Clear-minded',
  'Hungry',
] as const;

export type CuratedEffectTag = typeof CURATED_EFFECT_TAGS[number];

// Maximum number of curated effect tags per pick
export const MAX_EFFECT_TAGS = 3;

// Category-specific field visibility mapping
// Determines which optional fields to show based on selected category
export const CATEGORY_FIELDS: Record<string, string[]> = {
  'Flower': ['strain_type', 'format', 'package_size', 'potency_summary', 'top_terpenes', 'intensity'],
  'Pre-rolls': ['strain_type', 'format', 'package_size', 'is_infused', 'potency_summary', 'intensity'],
  'Vapes': ['strain_type', 'format', 'potency_summary', 'intensity'],
  'Edibles': ['format', 'package_size', 'potency_summary', 'intensity'],
  'Beverages': ['format', 'package_size', 'potency_summary', 'intensity'],
  'Concentrates': ['strain_type', 'format', 'potency_summary', 'intensity'],
  'Tinctures': ['format', 'potency_summary'],
  'Topicals': ['format', 'potency_summary'],
  'Accessories': ['format'],
  'Deals': ['deal_title', 'deal_type', 'deal_value', 'deal_applies_to', 'deal_days', 'deal_fine_print'],
};

// Categories where strain type is relevant
export const STRAIN_TYPE_CATEGORIES = [
  'Flower',
  'Pre-rolls', 
  'Vapes',
  'Edibles',
  'Concentrates',
];

// Categories where intensity makes sense
export const INTENSITY_CATEGORIES = [
  'Flower',
  'Pre-rolls',
  'Vapes',
  'Edibles',
  'Beverages',
  'Concentrates',
];

// Strain type options
export const STRAIN_TYPES = [
  { value: 'indica', label: 'Indica' },
  { value: 'sativa', label: 'Sativa' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'cbd-dominant', label: 'CBD-dominant' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'n-a', label: 'N/A' },
] as const;

// Intensity options
export const INTENSITY_OPTIONS = [
  { value: 'light', label: 'Light', description: 'Mild effects, great for beginners' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced experience' },
  { value: 'strong', label: 'Strong', description: 'Potent, for experienced users' },
  { value: 'heavy', label: 'Heavy hitter', description: 'Very potent, proceed with caution' },
] as const;

// Deal type options
export const DEAL_TYPES = [
  { value: 'percent-off', label: 'Percent Off' },
  { value: 'dollar-off', label: 'Dollar Off' },
  { value: 'bogo', label: 'Buy One Get One' },
  { value: 'bundle', label: 'Bundle Deal' },
  { value: 'tiered', label: 'Tiered Discount' },
  { value: 'other', label: 'Other' },
] as const;

// Days of week for deal scheduling
export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

// Format options by category
export const FORMAT_OPTIONS: Record<string, string[]> = {
  'Flower': ['Indoor', 'Outdoor', 'Greenhouse', 'Smalls', 'Pre-ground', 'Infused'],
  'Pre-rolls': ['Single', 'Multi-pack', 'Mini', 'King-size', 'Blunt'],
  'Vapes': ['Cart', 'Disposable', 'Pod'],
  'Edibles': ['Gummy', 'Chocolate', 'Baked', 'Capsule', 'Tablet', 'Hard candy'],
  'Beverages': ['Drink', 'Shot', 'Powder mix'],
  'Concentrates': ['Badder', 'Shatter', 'Sugar', 'Diamonds', 'Rosin', 'Sauce', 'Crumble'],
  'Tinctures': ['Oil', 'Alcohol', 'Glycerin'],
  'Topicals': ['Balm', 'Lotion', 'Patch', 'Roll-on', 'Cream'],
  'Accessories': ['Pipe', 'Bong', 'Grinder', 'Battery', 'Rolling tray', 'Storage'],
};

/**
 * Check if a field should be shown for a given category
 */
export function shouldShowField(field: string, categoryName: string): boolean {
  return CATEGORY_FIELDS[categoryName]?.includes(field) ?? false;
}

/**
 * Check if strain type is relevant for a category
 */
export function isStrainTypeRelevant(categoryName: string): boolean {
  return STRAIN_TYPE_CATEGORIES.includes(categoryName);
}

/**
 * Check if intensity is relevant for a category
 */
export function isIntensityRelevant(categoryName: string): boolean {
  return INTENSITY_CATEGORIES.includes(categoryName);
}

/**
 * Check if this is a Deals category pick
 */
export function isDealsCategory(categoryName: string): boolean {
  return categoryName === 'Deals';
}

/**
 * Get format options for a category
 */
export function getFormatOptions(categoryName: string): string[] {
  return FORMAT_OPTIONS[categoryName] ?? [];
}



