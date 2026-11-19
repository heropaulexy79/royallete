import MenuClient from '@/components/MenuClient';
import { fetchServerMenuData } from '@/lib/serverFeatured';

export const dynamic = 'force-dynamic';

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = typeof params.category === 'string' ? params.category : undefined;
  const { items, categories } = await fetchServerMenuData(initialCategory);

  return (
    <MenuClient
      initialItems={items}
      initialCategories={categories}
      initialCategoryParam={initialCategory}
    />
  );
}
