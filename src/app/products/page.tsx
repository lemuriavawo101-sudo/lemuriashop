import React, { Suspense } from 'react';
import styles from './Products.module.css';
import FilterSidebar from './FilterSidebar';
import ProductGridCard from './ProductGridCard';
import { getProducts } from '@/lib/data';

export const metadata = {
  title: "Archive | Lemuria Heritage",
  description: "Browse our complete collection of ancient weaponry and traditional heritage artifacts.",
};

const PRICE_RANGES = [
  { label: 'Under ₹2,000', min: 0, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: 'Over ₹10,000', min: 10000, max: 1000000 }
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const cat = typeof params.cat === 'string' ? params.cat.split(',') : [];
  const priceLabel = typeof params.price === 'string' ? params.price : null;
  const discountLabel = typeof params.discount === 'string' ? params.discount : null;

  const products = await getProducts();
  
  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = !q || p.name.toLowerCase().includes(q.toLowerCase()) || 
                          p.description.toLowerCase().includes(q.toLowerCase());
    const matchesCategory = cat.length === 0 || cat.includes(p.category);
    
    const selectedPriceRange = PRICE_RANGES.find(r => r.label === priceLabel);
    const matchesPrice = !selectedPriceRange || p.variants.some((v: any) => 
      v.price >= selectedPriceRange.min && v.price <= selectedPriceRange.max
    );

    const matchesDiscount = !discountLabel || p.variants.some((v: any) => {
      if (!v.old_price || v.old_price <= v.price) return false;
      const pct = ((v.old_price - v.price) / v.old_price) * 100;
      return pct >= parseInt(discountLabel);
    });
    
    return matchesSearch && matchesCategory && matchesPrice && matchesDiscount;
  });

  return (
    <div className={styles.productsContainer}>
      <header className={styles.headerSection}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>Heritage / Collection / All Products</nav>
          <h1 className={styles.title}>THE ARCHIVE</h1>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.mainLayout}>
          <Suspense fallback={<div>Loading Filters...</div>}>
            <FilterSidebar />
          </Suspense>

          <section className={styles.contentArea}>
            <div className={styles.gridInfo}>
              <div className={styles.count}>SHOWING {filteredProducts.length} OF {products.length} ARTIFACTS</div>
            </div>

            <div className={styles.productGrid}>
              {filteredProducts.map((product: any) => (
                <ProductGridCard 
                  key={product.id} 
                  product={product} 
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>NO MATCHES IN THE CRYPT</h3>
                <p>Try adjusting your search or filters to discover hidden heritage.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
