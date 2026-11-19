import { FoodItem } from '@/types/schema';
import { isItemFeatured } from './featured';

export const CACHE_KEY_MENU = 'deskilz_menu_v4';
export const CACHE_KEY_FEATURED = 'deskilz_featured_v4';
const LEGACY_CACHE_KEYS = ['deskilz_menu_cache', 'deskilz_menu_v2', 'deskilz_menu_v3'];

/**
 * Purge outdated or oversized legacy cache keys to prevent stale item counts
 * (e.g. initial 8-item or 13-item flashes) and QuotaExceededError.
 */
export function purgeLegacyCaches(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_CACHE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('Failed to purge legacy cache keys:', e);
  }
}

/**
 * Load featured items synchronously for instant, zero-flicker homepage rendering.
 * Strictly respects the admin dashboard selections and includes uploaded images.
 */
export function loadFeaturedCache(): FoodItem[] {
  if (typeof window === 'undefined') return [];
  purgeLegacyCaches();
  try {
    const raw = localStorage.getItem(CACHE_KEY_FEATURED);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items) && items.length > 0) {
        return items.filter(isItemFeatured);
      }
    }
  } catch (e) {
    console.warn('Featured cache read error:', e);
  }
  return [];
}

/**
 * Save featured items to a lightweight dedicated cache.
 * Because featured dishes are typically 5–15 items, this comfortably fits in
 * localStorage alongside their uploaded/custom images without hitting quota limits.
 */
export function saveFeaturedCache(items: FoodItem[]): void {
  if (typeof window === 'undefined') return;
  const featured = items.filter(isItemFeatured);
  try {
    localStorage.setItem(CACHE_KEY_FEATURED, JSON.stringify(featured));
  } catch (e) {
    // If featured images exceed quota, strip oversized base64 strings or clear key so stale data is never kept
    try {
      const sanitized = featured.map((item) =>
        item.image_url && item.image_url.startsWith('data:image') && item.image_url.length > 50000
          ? { ...item, image_url: '' }
          : item
      );
      localStorage.setItem(CACHE_KEY_FEATURED, JSON.stringify(sanitized));
    } catch {
      try {
        localStorage.removeItem(CACHE_KEY_FEATURED);
      } catch {}
    }
    console.warn('Featured cache write fallback:', e);
  }
}

/**
 * Load full menu items synchronously for instant admin/menu display.
 */
export function loadMenuCache(): FoodItem[] {
  if (typeof window === 'undefined') return [];
  purgeLegacyCaches();
  try {
    const raw = localStorage.getItem(CACHE_KEY_MENU);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }
  } catch (e) {
    console.warn('Menu cache read error:', e);
  }
  return [];
}

/**
 * Save menu items safely to localStorage.
 * Ensures the browser never crashes with DOMException QuotaExceededError
 * even when the menu contains dozens of high-res Base64 uploaded images.
 */
export function saveMenuCache(items: FoodItem[]): void {
  if (typeof window === 'undefined') return;
  
  // 1. Always update the featured cache first
  saveFeaturedCache(items);

  // 2. Try writing the full items array
  try {
    const fullJson = JSON.stringify(items);
    if (fullJson.length < 3 * 1024 * 1024) {
      localStorage.setItem(CACHE_KEY_MENU, fullJson);
      return;
    }
  } catch (e) {
    // QuotaExceededError - continue to fallback
  }

  // 3. Fallback: preserve full images for featured and small images,
  // trim oversized base64 strings (>20KB) for synchronous cache.
  // Live Firestore snapshot populates full images on hydration.
  try {
    const sanitized = items.map((item) => {
      if (isItemFeatured(item)) return item;
      if (item.image_url && item.image_url.startsWith('data:image') && item.image_url.length > 20000) {
        return { ...item, image_url: '' };
      }
      return item;
    });
    localStorage.setItem(CACHE_KEY_MENU, JSON.stringify(sanitized));
  } catch (e2) {
    // Never leave stale cache behind if localStorage is completely full
    try {
      localStorage.removeItem(CACHE_KEY_MENU);
    } catch {}
    console.warn('Menu cache safe write fallback error:', e2);
  }
}
