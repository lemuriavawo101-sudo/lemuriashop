import Hero from '@/components/Hero/Hero';
import ProductSlider from '@/components/ProductSlider/ProductSlider';
import Collection from '@/components/Collection/Collection';
import { getProducts, getDeals } from '@/lib/data';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const [allProducts, dealProducts] = await Promise.all([
    getProducts(),
    getDeals()
  ]);

  return (
    <main>
      <Hero />
      <ProductSlider products={dealProducts as any} />
      <Collection products={allProducts as any} />
    </main>
  );
}
