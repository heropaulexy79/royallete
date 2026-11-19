import HomeClient from '@/components/HomeClient';
import { fetchServerFeaturedItems } from '@/lib/serverFeatured';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialFeatured = await fetchServerFeaturedItems();
  return <HomeClient initialFeatured={initialFeatured} />;
}
