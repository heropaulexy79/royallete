import { FoodItem, ProductCategory, Review } from '@/types/schema';

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
}

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

interface RunQueryRow {
  document?: FirestoreDocument;
}

function getNumber(val?: FirestoreValue): number | undefined {
  if (!val) return undefined;
  if (val.integerValue !== undefined) return Number(val.integerValue);
  if (val.doubleValue !== undefined) return Number(val.doubleValue);
  return undefined;
}

export interface ServerCategory {
  name: string;
  image_url?: string;
  tag?: string;
}

/**
 * Fetches live category metadata (including admin-uploaded category banner images)
 * directly from Firestore on the server so the homepage renders the exact admin
 * category pictures immediately on reload without flashing hardcoded fallback images.
 */
export async function fetchServerCategories(): Promise<ServerCategory[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || projectId === 'placeholder') {
    return [];
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/custom_categories?pageSize=100`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { documents?: FirestoreDocument[] };
    if (!Array.isArray(data.documents)) return [];

    return data.documents
      .map((doc) => {
        const id = doc.name.split('/').pop() || '';
        const f = doc.fields || {};
        return {
          name: f.name?.stringValue || id,
          image_url: f.image_url?.stringValue || undefined,
          tag: f.tag?.stringValue || undefined,
        };
      })
      .filter((c) => Boolean(c.name));
  } catch (err) {
    console.warn('Server categories fetch fallback:', err);
    return [];
  }
}

/**
 * Fetches live featured dishes directly from Firestore on the server.
 * Only downloads documents where `is_featured == true`, keeping payload small
 * and ensuring the homepage renders the exact current featured dishes immediately on reload.
 */
export async function fetchServerFeaturedItems(): Promise<FoodItem[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || projectId === 'placeholder') {
    return [];
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(4500),
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'foodItems' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'is_featured' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
        },
      }),
    });

    if (!res.ok) return [];

    const rows = (await res.json()) as RunQueryRow[];
    if (!Array.isArray(rows)) return [];

    const items: FoodItem[] = [];
    for (const row of rows) {
      const doc = row.document;
      if (!doc || !doc.fields) continue;
      const f = doc.fields;

      const isLegacy = f.is_legacy?.booleanValue === true;
      const isAvailable = f.is_available?.booleanValue !== false;
      if (isLegacy || !isAvailable) continue;

      const id = doc.name.split('/').pop() || '';
      items.push({
        id,
        name: f.name?.stringValue || '',
        price: getNumber(f.price) ?? 0,
        category: (f.category?.stringValue || 'Food') as ProductCategory,
        description: f.description?.stringValue || '',
        image_url: f.image_url?.stringValue || '',
        is_available: true,
        is_featured: true,
        order_index: getNumber(f.order_index),
        restaurant_id: f.restaurant_id?.stringValue || 'deskilz',
      });
    }

    return items;
  } catch (err) {
    console.warn('Server featured fetch fallback:', err);
    return [];
  }
}

function mapFirestoreDoc(doc: FirestoreDocument): FoodItem | null {
  if (!doc || !doc.fields) return null;
  const f = doc.fields;
  const isLegacy = f.is_legacy?.booleanValue === true;
  const isAvailable = f.is_available?.booleanValue !== false;
  if (isLegacy || !isAvailable) return null;

  const id = doc.name.split('/').pop() || '';
  return {
    id,
    name: f.name?.stringValue || '',
    price: getNumber(f.price) ?? 0,
    category: (f.category?.stringValue || 'Food') as ProductCategory,
    description: f.description?.stringValue || '',
    image_url: f.image_url?.stringValue || '',
    is_available: true,
    is_featured: f.is_featured?.booleanValue === true,
    order_index: getNumber(f.order_index),
    restaurant_id: f.restaurant_id?.stringValue || 'deskilz',
  };
}

/**
 * Fetches lightweight metadata for ALL menu items (excluding heavy Base64 image_url)
 * in a single ~48 KB request so all 92 items render immediately on the server.
 */
async function fetchServerMenuMetadata(): Promise<FoodItem[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || projectId === 'placeholder') return [];

  const fields = [
    'name',
    'price',
    'category',
    'description',
    'is_available',
    'is_featured',
    'is_legacy',
    'order_index',
    'restaurant_id',
  ];
  const mask = fields.map((f) => `mask.fieldPaths=${f}`).join('&');
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/foodItems?pageSize=300&${mask}`;

  try {
    const allDocs: FirestoreDocument[] = [];
    let pageToken = '';
    do {
      const url = pageToken ? `${baseUrl}&pageToken=${encodeURIComponent(pageToken)}` : baseUrl;
      const res = await fetch(url, {
        next: { revalidate: 15 },
        signal: AbortSignal.timeout(4500),
      });
      if (!res.ok) break;
      const data = (await res.json()) as { documents?: FirestoreDocument[]; nextPageToken?: string };
      if (Array.isArray(data.documents)) {
        allDocs.push(...data.documents);
      }
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    return allDocs
      .map(mapFirestoreDoc)
      .filter((item): item is FoodItem => item !== null);
  } catch (err) {
    console.warn('Server menu metadata fetch fallback:', err);
    return [];
  }
}

/**
 * Fetches full items (including uploaded images) for a single category only.
 */
async function fetchServerCategoryItems(category: string): Promise<FoodItem[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || projectId === 'placeholder' || !category) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(4500),
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'foodItems' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'category' },
              op: 'EQUAL',
              value: { stringValue: category },
            },
          },
        },
      }),
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as RunQueryRow[];
    if (!Array.isArray(rows)) return [];
    return rows
      .map((r) => (r.document ? mapFirestoreDoc(r.document) : null))
      .filter((item): item is FoodItem => item !== null);
  } catch (err) {
    console.warn('Server category items fetch fallback:', err);
    return [];
  }
}

/**
 * Fetches initial data for /menu in parallel:
 * 1. All menu items' metadata (~48 KB)
 * 2. Full images for the active category (or Shawarma by default)
 * 3. Custom categories
 */
export async function fetchServerMenuData(initialCategory?: string): Promise<{
  items: FoodItem[];
  categories: string[];
}> {
  const targetCategory =
    initialCategory && initialCategory !== 'All' ? initialCategory : 'Shawarma';

  const [metaItems, categoryWithImages, serverCategories] = await Promise.all([
    fetchServerMenuMetadata(),
    fetchServerCategoryItems(targetCategory),
    fetchServerCategories(),
  ]);

  const imageMap = new Map<string, string>();
  for (const item of categoryWithImages) {
    if (item.image_url) imageMap.set(item.id, item.image_url);
  }

  const mergedItems =
    metaItems.length > 0
      ? metaItems.map((item) => {
          const fullImg = imageMap.get(item.id);
          return fullImg ? { ...item, image_url: fullImg } : item;
        })
      : categoryWithImages;

  return {
    items: mergedItems,
    categories: serverCategories.map((c) => c.name),
  };
}

/**
 * Fetches admin-approved reviews (`show_on_homepage == true`) on the server
 * so the homepage review section renders immediately on reload.
 */
export async function fetchServerApprovedReviews(): Promise<Review[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || projectId === 'placeholder') return [];

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(4500),
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'reviews' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'show_on_homepage' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
        },
      }),
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as RunQueryRow[];
    if (!Array.isArray(rows)) return [];

    const reviews: Review[] = [];
    for (const row of rows) {
      const doc = row.document;
      if (!doc || !doc.fields) continue;
      const f = doc.fields;
      const id = doc.name.split('/').pop() || '';
      reviews.push({
        id,
        customer_name: f.customer_name?.stringValue || 'Customer',
        rating: getNumber(f.rating) ?? 5,
        comment: f.comment?.stringValue || '',
        order_number: getNumber(f.order_number),
        order_id: f.order_id?.stringValue,
        show_on_homepage: true,
      });
    }
    return reviews;
  } catch (err) {
    console.warn('Server approved reviews fetch fallback:', err);
    return [];
  }
}
