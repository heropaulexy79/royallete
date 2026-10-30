import { FoodItem, OrderItem } from '@/types/schema';

/**
 * Category-based complementary suggestions matrix
 */
const CATEGORY_COMPLEMENTS: Record<string, string[]> = {
  Shawarma:          ['Drinks'],
  Pizza:             ['Drinks', 'Snacks'],
  Burger:            ['Chicken & Chips', 'Drinks'],
  Food:              ['Drinks', 'Food'],
  'Chicken & Chips': ['Chicken & Chips', 'Drinks'],
  'Ice Cream':       ['Snacks'],
  Snacks:            ['Drinks'],
  Drinks:            ['Snacks', 'Shawarma'],
};

const HIGH_AFFINITY = [
  'extra ketchup', 'plantain', 'coleslaw',
  'fanta', 'coke', 'maltina classic', 'meat pie',
];

/**
 * Get smart recommendations for a single just-added item.
 * Used by the AddToCart popup to show complementary products.
 */
export function getItemRecommendations({
  item,
  cart,
  allItems,
  limit = 3,
}: {
  item: FoodItem;
  cart: OrderItem[];
  allItems: FoodItem[];
  limit?: number;
}): FoodItem[] {
  if (!allItems || allItems.length === 0) return [];

  const excludeIds = new Set([item.id, ...cart.map((i) => i.food_item_id)]);

  const available = allItems.filter(
    (i) =>
      i.is_available !== false &&
      !(i as { is_legacy?: boolean }).is_legacy &&
      !excludeIds.has(i.id)
  );

  const targetCategories = new Set<string>(CATEGORY_COMPLEMENTS[item.category] || []);

  const scored = available.map((candidate) => {
    let score = 0;
    const normName = candidate.name.toLowerCase();
    if (targetCategories.has(candidate.category)) score += 10;
    if (HIGH_AFFINITY.some((a) => normName.includes(a))) score += 5;
    if (candidate.price <= 1500) score += 3;
    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.candidate);
}

/**
 * Get complementary product recommendations based on cart contents.
 * Filters out items already in the cart and unavailable items.
 */
export function getRecommendations({
  cart,
  allItems,
  limit = 4,
}: {
  cart: OrderItem[];
  allItems: FoodItem[];
  limit?: number;
}): FoodItem[] {
  if (!allItems || allItems.length === 0) return [];

  const cartItemIds = new Set(cart.map((i) => i.food_item_id));

  const availableItems = allItems.filter(
    (item) =>
      item.is_available !== false &&
      !(item as { is_legacy?: boolean }).is_legacy &&
      !cartItemIds.has(item.id)
  );

  if (availableItems.length === 0) return [];

  const cartCategories = new Set(
    cart
      .map((ci) => {
        const found = allItems.find((i) => i.id === ci.food_item_id);
        return found?.category || ci.category || '';
      })
      .filter(Boolean)
  );

  if (cartCategories.size === 0) {
    const defaultCategories = ['Food', 'Shawarma', 'Pizza', 'Drinks'];
    return availableItems.filter((i) => defaultCategories.includes(i.category)).slice(0, limit);
  }

  const targetCategories = new Set<string>();
  cartCategories.forEach((cat) => {
    (CATEGORY_COMPLEMENTS[cat] || []).forEach((c) => targetCategories.add(c));
  });

  const scored = availableItems.map((item) => {
    let score = 0;
    const normName = item.name.toLowerCase();
    if (targetCategories.has(item.category)) score += 10;
    if (HIGH_AFFINITY.some((aff) => normName.includes(aff))) score += 5;
    if (item.price <= 1500) score += 3;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
