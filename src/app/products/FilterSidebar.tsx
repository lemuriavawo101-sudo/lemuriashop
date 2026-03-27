"use client";

import React, { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './Products.module.css';

const CATEGORIES = [
  "Weapons", 
  "Decoration", 
  "Books", 
  "Attire", 
  "Tools"
];

const PRICE_RANGES = [
  { label: 'Under ₹2,000', min: 0, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: 'Over ₹10,000', min: 10000, max: 1000000 }
];

const DISCOUNTS = [10, 25, 50];

const FilterSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const toggleCategory = (cat: string) => {
    const current = searchParams.get('cat')?.split(',') || [];
    const next = current.includes(cat) 
      ? current.filter(c => c !== cat) 
      : [...current, cat];
    
    router.push(pathname + '?' + createQueryString('cat', next.length ? next.join(',') : null), { scroll: false });
  };

  const togglePriceRange = (label: string) => {
    const current = searchParams.get('price');
    router.push(pathname + '?' + createQueryString('price', current === label ? null : label), { scroll: false });
  };

  const toggleDiscount = (d: number) => {
    const current = searchParams.get('discount');
    router.push(pathname + '?' + createQueryString('discount', current === d.toString() ? null : d.toString()), { scroll: false });
  };

  const handleSearch = (q: string) => {
    router.push(pathname + '?' + createQueryString('q', q || null), { scroll: false });
  };

  const resetFilters = () => {
    router.push(pathname);
  };

  const selectedCategories = searchParams.get('cat')?.split(',') || [];
  const selectedPriceRange = searchParams.get('price');
  const selectedDiscount = searchParams.get('discount');
  const searchQuery = searchParams.get('q') || '';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.searchBox}>
        <input 
          type="text" 
          placeholder="SEARCH ARTIFACTS..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>CATEGORIES</h4>
        <div className={styles.filterList}>
          {CATEGORIES.map(cat => (
            <label 
              key={cat} 
              className={`${styles.filterItem} ${selectedCategories.includes(cat) ? styles.itemActive : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              <div className={styles.checkbox}>
                {selectedCategories.includes(cat) && <span className={styles.checkMark}>✓</span>}
              </div>
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>PRICE RANGE</h4>
        <div className={styles.filterList}>
          {PRICE_RANGES.map(range => (
            <label 
              key={range.label} 
              className={`${styles.filterItem} ${selectedPriceRange === range.label ? styles.itemActive : ''}`}
              onClick={() => togglePriceRange(range.label)}
            >
              <div className={styles.checkbox}>
                {selectedPriceRange === range.label && <span className={styles.checkMark}>✓</span>}
              </div>
              {range.label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>DISCOUNT</h4>
        <div className={styles.filterList}>
          {DISCOUNTS.map(d => (
            <label 
              key={d} 
              className={`${styles.filterItem} ${selectedDiscount === d.toString() ? styles.itemActive : ''}`}
              onClick={() => toggleDiscount(d)}
            >
              <div className={styles.checkbox}>
                {selectedDiscount === d.toString() && <span className={styles.checkMark}>✓</span>}
              </div>
              {d}% Off or More
            </label>
          ))}
        </div>
      </div>

      {(searchQuery || selectedCategories.length > 0 || selectedPriceRange || selectedDiscount) && (
        <button className={styles.resetBtn} onClick={resetFilters} style={{width: '100%', marginTop: '20px'}}>
          RESET ALL
        </button>
      )}
    </aside>
  );
};

export default FilterSidebar;
