export const DEFAULT_FEATURED_NAMES = new Set([
  'chicken shawarma (plain)',
  'double chicken suya special',
  'chicken pizza — medium size',
  'chicken pizza - medium size',
  'meatball pizza — small size',
  'meatball pizza - small size',
  'classic beef burger',
  'chicken & chips (barbecued)',
  'jollof rice',
  'fried rice',
  'parfait large',
]);

/**
 * Determines whether a dish is considered "Featured" on the homepage.
 * Priority:
 * 1. If explicitly set to true or false in Firestore or state, that takes precedence.
 * 2. If undefined (not yet explicitly toggled), defaults to true for the 9 core approved featured dishes.
 */
export function isItemFeatured(item: { name: string; is_featured?: boolean | string }): boolean {
  if (item.is_featured === true || item.is_featured === 'true') return true;
  if (item.is_featured === false || item.is_featured === 'false') return false;
  const normalized = (item.name || '').trim().toLowerCase();
  return DEFAULT_FEATURED_NAMES.has(normalized);
}
