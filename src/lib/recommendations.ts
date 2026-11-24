import { FoodItem, Order, OrderItem } from '@/types/schema';

export type CoPurchaseMap = Record<string, Record<string, number>>;

type MealRole =
  | 'rice'
  | 'rice_combo'
  | 'rice_side'
  | 'protein'
  | 'swallow'
  | 'shawarma'
  | 'pizza'
  | 'burger'
  | 'chips'
  | 'condiment'
  | 'drink'
  | 'dessert'
  | 'snack'
  | 'other';

function detectRole(name: string, category: string): MealRole {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (n.includes('ketchup') || n.includes('sauce')) return 'condiment';
  if (n.includes('plantain') || n.includes('coleslaw')) return 'rice_side';
  if (n.includes('rice combo')) return 'rice_combo';
  if (n.includes('jollof') || n.includes('fried rice') || n.includes('rice')) return 'rice';
  if (n.includes('poundo') || n.includes('egusi') || n.includes('swallow') || n.includes('amala') || n.includes('eba') || n.includes('semo')) {
    return 'swallow';
  }
  if (n.includes('grilled chicken') || n.includes('crispy chicken') || n.includes('turkey') || n.includes('beef')) {
    if (c === 'food') return 'protein';
  }
  if (c === 'shawarma' || n.includes('shawarma')) return 'shawarma';
  if (c === 'pizza' || n.includes('pizza')) return 'pizza';
  if (c === 'burger' || n.includes('burger')) return 'burger';
  if (c === 'chicken & chips' || n.includes('chips') || n.includes('fries')) return 'chips';
  if (c === 'drinks' || n.includes('water') || n.includes('coke') || n.includes('fanta') || n.includes('malt') || n.includes('yoghurt') || n.includes('chapman') || n.includes('mojito') || n.includes('fayrouz') || n.includes('chi active') || n.includes('chivita') || n.includes('monster') || n.includes('smirnoff') || n.includes('bullet')) {
    return 'drink';
  }
  if (c === 'ice cream' || n.includes('parfait') || n.includes('ice cream') || n.includes('doughnut') || n.includes('vanilla') || n.includes('strawberry') || n.includes('vanstraw') || n.includes('vanchoco')) {
    return 'dessert';
  }
  if (c === 'snacks' || n.includes('meat pie') || n.includes('chicken pie') || n.includes('sausage')) {
    return 'snack';
  }
  if (c === 'combo') return 'rice_combo';
  return 'other';
}

const POPULAR_DRINKS = ['coke', 'fanta', 'maltina', 'chapman', 'fayrouz', 'yoghurt', 'water', 'chi active', 'chivita'];

/**
 * Builds a co-purchase frequency matrix from historical Firestore orders.
 * Counts how often item B is bought in the same order as item A.
 * Automatically trains recommendations as real orders accumulate.
 */
export function buildCoPurchaseMap(orders: Pick<Order, 'items'>[]): CoPurchaseMap {
  const map: CoPurchaseMap = {};
  for (const order of orders) {
    const items = order.items || [];
    if (items.length < 2) continue;

    // Deduplicate normalized dish names within a single order
    const keys = Array.from(
      new Set(
        items
          .map((i) => (i.name || '').trim().toLowerCase())
          .filter(Boolean)
      )
    );

    for (let i = 0; i < keys.length; i++) {
      const a = keys[i];
      if (!map[a]) map[a] = {};
      for (let j = 0; j < keys.length; j++) {
        if (i === j) continue;
        const b = keys[j];
        map[a][b] = (map[a][b] || 0) + 1;
      }
    }
  }
  return map;
}

/**
 * Computes a smart compatibility score for a candidate add-on given the full cart context.
 */
function scoreCandidate({
  candidate,
  cartRoles,
  cartNames,
  coPurchaseMap,
}: {
  candidate: FoodItem;
  cartRoles: Set<MealRole>;
  cartNames: Set<string>;
  coPurchaseMap?: CoPurchaseMap;
}): number {
  let score = 0;
  const candName = (candidate.name || '').toLowerCase();
  const candRole = detectRole(candidate.name, candidate.category);

  const hasDrink = cartRoles.has('drink');
  const hasDessert = cartRoles.has('dessert');
  const hasChips = cartRoles.has('chips');
  const hasRiceSide = cartRoles.has('rice_side');
  const hasProtein = cartRoles.has('protein');
  const hasCondiment = cartRoles.has('condiment');

  // 1. Dish-specific intelligent pairing rules
  if (cartRoles.has('rice')) {
    if (candRole === 'rice_side') score += 30; // Plantain, Coleslaw
    if (candRole === 'protein' && !hasProtein) score += 28; // Grilled / Crispy Chicken
    if (candRole === 'drink' && !hasDrink) score += 22;
    if (candRole === 'dessert' && !hasDessert) score += 10;
    if (candRole === 'rice' || candRole === 'rice_combo' || candRole === 'swallow') score -= 25; // Don't suggest another heavy carb
    if (candRole === 'condiment') score -= 15; // Don't suggest ketchup with Jollof/Fried rice
  }

  if (cartRoles.has('rice_combo')) {
    // Rice combo already includes rice + chicken — focus on sides, drinks, and treats
    if (candRole === 'rice_side' && !hasRiceSide) score += 26;
    if (candRole === 'drink' && !hasDrink) score += 26;
    if (candRole === 'dessert' && !hasDessert) score += 16;
    if (candRole === 'rice' || candRole === 'rice_combo' || candRole === 'protein') score -= 20;
  }

  if (cartRoles.has('swallow')) {
    if (candRole === 'drink' && !hasDrink) score += 28;
    if (candRole === 'protein' && !hasProtein) score += 20;
    if (candName.includes('water') || candName.includes('malt') || candName.includes('chapman')) score += 8;
    if (candRole === 'condiment' || candRole === 'chips' || candRole === 'pizza' || candRole === 'burger') score -= 25;
  }

  if (cartRoles.has('burger')) {
    if (candName.includes('chips only') && !hasChips) score += 32;
    else if (candRole === 'chips' && !hasChips) score += 22;
    if (candRole === 'condiment' && !hasCondiment) score += 18;
    if (candRole === 'drink' && !hasDrink) score += 24;
    if (candRole === 'dessert' && !hasDessert) score += 14;
    if (candRole === 'burger') score -= 18;
  }

  if (cartRoles.has('shawarma')) {
    if (candRole === 'drink' && !hasDrink) score += 26;
    if (candName.includes('chips only') && !hasChips) score += 22;
    if (candRole === 'dessert' && !hasDessert) score += 16;
    if (candRole === 'snack') score += 12;
    if (candRole === 'shawarma') score -= 18;
  }

  if (cartRoles.has('pizza')) {
    if (candRole === 'drink' && !hasDrink) score += 28;
    if (candRole === 'chips' && !hasChips) score += 20;
    if (candRole === 'protein') score += 18; // Crispy/Grilled chicken pairs great with pizza
    if (candRole === 'dessert' && !hasDessert) score += 16;
    if (candRole === 'pizza') score -= 20;
  }

  if (cartRoles.has('chips')) {
    if (candRole === 'condiment' && !hasCondiment) score += 24;
    if (candName.includes('coleslaw') && !hasRiceSide) score += 20;
    if (candRole === 'drink' && !hasDrink) score += 26;
    if (candRole === 'dessert' && !hasDessert) score += 12;
  }

  if (cartRoles.has('snack') && cartRoles.size === 1) {
    if (candRole === 'drink' && !hasDrink) score += 28;
    if (candRole === 'dessert' && !hasDessert) score += 18;
    if (candRole === 'snack') score += 12;
  }

  if (cartRoles.has('dessert') && cartRoles.size === 1) {
    if (candRole === 'snack') score += 24;
    if (candRole === 'drink' && !hasDrink) score += 18;
    if (candRole === 'shawarma' || candRole === 'burger') score += 14;
  }

  if (cartRoles.has('drink') && cartRoles.size === 1) {
    // Customer only has a drink — suggest popular quick bites, NOT more drinks
    if (candRole === 'shawarma' || candRole === 'burger' || candRole === 'snack' || candRole === 'chips') {
      score += 24;
    }
    if (candRole === 'drink') score -= 30;
  }

  // 2. Cart saturation penalties (don't keep pushing what they already have!)
  if (hasDrink && candRole === 'drink') score -= 22;
  if (hasDessert && candRole === 'dessert') score -= 18;
  if (hasChips && candRole === 'chips') score -= 20;
  if (hasCondiment && candRole === 'condiment') score -= 25;

  // 3. Popularity & impulse-buy price boost (add-ons work best when affordable)
  if (candRole === 'drink' && POPULAR_DRINKS.some((d) => candName.includes(d))) {
    score += 5;
  }
  if (candidate.price > 0 && candidate.price <= 2000) {
    score += 4;
  } else if (candidate.price <= 3500) {
    score += 2;
  }

  // 4. Self-trained co-purchase boost from real Firestore order history
  if (coPurchaseMap) {
    let coScore = 0;
    cartNames.forEach((cartItemName) => {
      const pairCount = coPurchaseMap[cartItemName]?.[candName] || 0;
      if (pairCount > 0) {
        coScore += Math.min(20, pairCount * 5);
      }
    });
    score += coScore;
  }

  return score;
}

/**
 * Picks top-scoring items while ensuring category diversity (max 2 items per category)
 * so the customer sees a balanced meal completion mix instead of 6 drinks in a row.
 */
function selectDiverseTop(
  scored: { item: FoodItem; score: number }[],
  limit: number,
  maxPerCategory = 2
): FoodItem[] {
  scored.sort((a, b) => b.score - a.score);
  const picked: FoodItem[] = [];
  const catCounts: Record<string, number> = {};

  for (const entry of scored) {
    if (picked.length >= limit) break;
    const cat = (entry.item.category || 'other').toLowerCase();
    const count = catCounts[cat] || 0;
    if (count >= maxPerCategory) continue;
    picked.push(entry.item);
    catCounts[cat] = count + 1;
  }

  // Fill any remaining slots if diversity cap left fewer than `limit`
  if (picked.length < limit) {
    const pickedIds = new Set(picked.map((p) => p.id));
    for (const entry of scored) {
      if (picked.length >= limit) break;
      if (!pickedIds.has(entry.item.id)) {
        picked.push(entry.item);
      }
    }
  }

  return picked;
}

/**
 * Get smart recommendations for a single just-added item.
 * Used by the AddToCart popup to show complementary products.
 */
export function getItemRecommendations({
  item,
  cart,
  allItems,
  coPurchaseMap,
  limit = 3,
}: {
  item: FoodItem;
  cart: OrderItem[];
  allItems: FoodItem[];
  coPurchaseMap?: CoPurchaseMap;
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

  const cartRoles = new Set<MealRole>([detectRole(item.name, item.category)]);
  const cartNames = new Set<string>([(item.name || '').trim().toLowerCase()]);

  cart.forEach((ci) => {
    const match = allItems.find((i) => i.id === ci.food_item_id);
    cartRoles.add(detectRole(ci.name, match?.category || ci.category || ''));
    if (ci.name) cartNames.add(ci.name.trim().toLowerCase());
  });

  const scored = available.map((candidate) => ({
    item: candidate,
    score: scoreCandidate({ candidate, cartRoles, cartNames, coPurchaseMap }),
  }));

  return selectDiverseTop(scored, limit, 1);
}

/**
 * Get intelligent complementary product recommendations based on the ENTIRE cart
 * plus real customer co-purchase history.
 */
export function getRecommendations({
  cart,
  allItems,
  coPurchaseMap,
  limit = 4,
}: {
  cart: OrderItem[];
  allItems: FoodItem[];
  coPurchaseMap?: CoPurchaseMap;
  limit?: number;
}): FoodItem[] {
  if (!allItems || allItems.length === 0) return [];

  const cartItemIds = new Set(cart.map((i) => i.food_item_id));
  const cartNames = new Set(cart.map((i) => (i.name || '').trim().toLowerCase()).filter(Boolean));

  const availableItems = allItems.filter(
    (item) =>
      item.is_available !== false &&
      !(item as { is_legacy?: boolean }).is_legacy &&
      !cartItemIds.has(item.id) &&
      !cartNames.has((item.name || '').trim().toLowerCase())
  );

  if (availableItems.length === 0) return [];

  const cartRoles = new Set<MealRole>();
  cart.forEach((ci) => {
    const found = allItems.find((i) => i.id === ci.food_item_id);
    cartRoles.add(detectRole(ci.name, found?.category || ci.category || ''));
  });

  if (cartRoles.size === 0) {
    const defaultCategories = ['Food', 'Shawarma', 'Pizza', 'Drinks'];
    return availableItems.filter((i) => defaultCategories.includes(i.category)).slice(0, limit);
  }

  const scored = availableItems.map((candidate) => ({
    item: candidate,
    score: scoreCandidate({ candidate, cartRoles, cartNames, coPurchaseMap }),
  }));

  return selectDiverseTop(scored, limit, 2);
}
