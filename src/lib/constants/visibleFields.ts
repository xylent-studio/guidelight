/**
 * Visible Fields System
 * 
 * Controls which fields are shown to customers on pick cards.
 * Staff can toggle individual fields on/off via eye icons in PickFormModal.
 * NULL visible_fields = use DEFAULT_VISIBLE_FIELDS (sensible defaults)
 */

export const TOGGLEABLE_FIELDS = [
  { key: 'one_liner', label: 'One-liner' },
  { key: 'why_i_love_it', label: 'Why I love it' },
  { key: 'effect_tags', label: 'Effect tags' },
  { key: 'time_of_day', label: 'Time of day' },
  { key: 'rating', label: 'Rating' },
  { key: 'potency_summary', label: 'Potency' },
  { key: 'intensity', label: 'Intensity' },
  { key: 'package_size', label: 'Package size' },
  { key: 'top_terpenes', label: 'Top terpenes' },
] as const;

export type ToggleableFieldKey = typeof TOGGLEABLE_FIELDS[number]['key'];

/**
 * Default visible fields when picks.visible_fields is NULL.
 * Shows the most common/useful fields by default.
 */
export const DEFAULT_VISIBLE_FIELDS: ToggleableFieldKey[] = [
  'one_liner',
  'effect_tags',
  'rating',
  'why_i_love_it',
];

/**
 * Get visible fields, falling back to defaults if null/undefined
 */
export function getVisibleFields(visibleFields: string[] | null | undefined): ToggleableFieldKey[] {
  if (!visibleFields || visibleFields.length === 0) {
    return DEFAULT_VISIBLE_FIELDS;
  }
  return visibleFields as ToggleableFieldKey[];
}

/**
 * Check if a specific field should be visible to customers
 */
export function isFieldVisible(fieldKey: ToggleableFieldKey, visibleFields: string[] | null | undefined): boolean {
  const fields = getVisibleFields(visibleFields);
  return fields.includes(fieldKey);
}

/**
 * Toggle a field's visibility in the array
 */
export function toggleFieldInArray(fieldKey: ToggleableFieldKey, currentFields: string[]): string[] {
  if (currentFields.includes(fieldKey)) {
    return currentFields.filter(k => k !== fieldKey);
  } else {
    return [...currentFields, fieldKey];
  }
}

