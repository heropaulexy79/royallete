import HomeClient from '@/components/HomeClient';
import {
  fetchServerApprovedReviews,
  fetchServerCategories,
  fetchServerFeaturedItems,
} from '@/lib/serverFeatured';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [initialFeatured, initialCategories, initialReviews] = await Promise.all([
    fetchServerFeaturedItems(),
    fetchServerCategories(),
    fetchServerApprovedReviews(),
  ]);
  return (
    <HomeClient
      initialFeatured={initialFeatured}
      initialCategories={initialCategories}
      initialReviews={initialReviews}
    />
  );
}
