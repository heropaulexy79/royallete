import HomeClient from '@/components/HomeClient';
import {
  fetchServerApprovedReviews,
  fetchServerCategories,
  fetchServerFeaturedItems,
} from '@/lib/serverFeatured';

// Edge-cached with 30s ISR so <Link href="/"> prefetches instantly (0ms tab switch, no blank flash)
// while client onSnapshot listeners keep featured items, categories, and reviews live in real time.
export const revalidate = 30;

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
