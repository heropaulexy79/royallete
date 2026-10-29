import { FoodItem, OrderItem } from '@/types/schema';

/**
 * Category-based complementary suggestions matrix
 */
const CATEGORY_COMPLEMENTS: Record<string, string[]> = {
  Shawarma: ['Drinks'],
  Pizza: ['Drinks', 'Snacks'],
  Burger: ['Chicken & Chips', 'Drinks'],
  Food: ['Drinks', 'Food'], // e.g. plantain, coleslaw, drinks
  'Chicken & Chips': ['Chicken & Chips', 'Drinks'], // e.g. extra ketchup, drinks
  'Ice Cream': ['Snacks'],
  Snacks: ['Drinks'],
  Drinks: ['Snacks', 'Shawarma'],
};

/**
 * Get complementary product recommendations based on cart contents or current viewing item.
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

  // Available items not already in the cart and not legacy
  const availableItems = allItems.filter(
    (item) => item.is_available !== false && !(item as { is_legacy?: boolean }).is_legacy && !cartItemIds.has(item.id)
  );

  if (availableItems.length === 0) return [];

  // Determine current categories in the cart
  const cartCategories = new Set(
    cart
      .map((ci) => {
        const found = allItems.find((i) => i.id === ci.food_item_id);
        return found?.category || ci.category || '';
      })
      .filter(Boolean)
  );

  // If cart is empty, recommend high-appeal items across top categories
  if (cartCategories.size === 0) {
    const defaultCategories = ['Food', 'Shawarma', 'Pizza', 'Drinks'];
    return availableItems
      .filter((i) => defaultCategories.includes(i.category))
      .slice(0, limit);
  }

  // Find target categories from complements
  const targetCategories = new Set<string>();
  cartCategories.forEach((cat) => {
    const complements = CATEGORY_COMPLEMENTS[cat] || [];
    complements.forEach((c) => targetCategories.add(c));
  });

  // Prioritize specific high-affinity sides (e.g. Extra Ketchup, Plantain, Coleslaw, chilled drinks)
  const highAffinityNames = ['extra ketchup', 'plantain', 'coleslaw', 'fanta', 'coke', 'maltina classic', 'meat pie'];

  const scored = availableItems.map((item) => {
    let score = 0;
    const normName = item.name.toLowerCase();

    // Matching complement category
    if (targetCategories.has(item.category)) {
      score += 10;
    }

    // Specific high-affinity complement
    if (highAffinityNames.some((aff) => normName.includes(aff))) {
      score += 5;
    }

    // Low friction add-ons (under ₦1,500) make easy basket additions
    if (item.price <= 1500) {
      score += 3;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.item);
}
