import { FoodItem, ProductCategory } from '@/types/schema';

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
      cache: 'no-store',
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
      cache: 'no-store',
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
