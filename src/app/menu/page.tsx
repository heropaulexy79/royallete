import MenuClient from '@/components/MenuClient';
import { fetchServerMenuData } from '@/lib/serverFeatured';

// Edge-cached with 30s ISR so <Link href="/menu"> prefetches in the background and switches
// from Featured -> Menu instantaneously without going blank.
export const revalidate = 30;

export default async function MenuPage() {
  const { items, categories } = await fetchServerMenuData();

  return (
    <MenuClient
      initialItems={items}
      initialCategories={categories}
    />
  );
}
