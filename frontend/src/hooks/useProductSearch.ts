import { useState, useEffect, useRef } from 'react';
import { productsApi } from '@/api/products.api';
import type { Product } from '@/types';

export interface Filters {
  category: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

const DEFAULT_FILTERS: Filters = {
  category: 'All',
  minPrice: '',
  maxPrice: '',
  inStock: false,
};

export function useProductSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [categories, setCategories] = useState<string[]>([]);
  const [results, setResults] = useState<{ items: Product[]; loading: boolean; searched: boolean }>(
    { items: [], loading: false, searched: false },
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    productsApi.categories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ items: [], loading: false, searched: false });
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults((s) => ({ ...s, loading: true }));
      productsApi
        .list({
          search: query,
          category: filters.category !== 'All' ? filters.category : undefined,
          minPrice: filters.minPrice !== '' ? Number(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice !== '' ? Number(filters.maxPrice) : undefined,
          inStock: filters.inStock || undefined,
          limit: 50,
        })
        .then((res) => setResults({ items: res.data.items, loading: false, searched: true }))
        .catch(() => setResults({ items: [], loading: false, searched: true }));
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, filters]);

  return { query, setQuery, filters, setFilters, categories, results };
}
