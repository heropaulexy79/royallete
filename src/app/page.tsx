import HomeClient from '@/components/HomeClient';
import { fetchServerCategories, fetchServerFeaturedItems } from '@/lib/serverFeatured';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [initialFeatured, initialCategories] = await Promise.all([
    fetchServerFeaturedItems(),
    fetchServerCategories(),
  ]);
  return (
    <HomeClient
      initialFeatured={initialFeatured}
      initialCategories={initialCategories}
    />
  );
}
