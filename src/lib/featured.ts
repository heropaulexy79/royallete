/**
 * Determines whether a dish is considered "Featured" on the homepage.
 * Strictly respects the admin dashboard setting: an item is only featured
 * if is_featured is explicitly true (boolean true or "true").
 */
export function isItemFeatured(item: { name?: string; is_featured?: boolean | string }): boolean {
  return item.is_featured === true || item.is_featured === 'true';
}
