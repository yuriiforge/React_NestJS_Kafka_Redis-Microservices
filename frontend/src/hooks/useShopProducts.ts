import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '@/api/products.api';
import type { Product } from '@/types';

const PAGE_SIZE = 24;

type LoadedFilter = { category: string; search: string } | null;

export function useShopProducts(category: string, search: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadedFilter, setLoadedFilter] = useState<LoadedFilter>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loading =
    loadedFilter === null ||
    loadedFilter.category !== category ||
    loadedFilter.search !== search;
  const hasMore = products.length < total;

  useEffect(() => {
    let cancelled = false;
    productsApi
      .list({
        category: category !== 'All' ? category : undefined,
        search: search || undefined,
        page: 1,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        if (!cancelled) {
          setProducts(res.data.items);
          setTotal(res.data.total);
          setPage(1);
          setLoadedFilter({ category, search });
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load products');
          setLoadedFilter({ category, search });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [category, search]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    productsApi
      .list({
        category: category !== 'All' ? category : undefined,
        search: search || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        setProducts((prev) => [...prev, ...res.data.items]);
        setPage(nextPage);
      })
      .catch(() => toast.error('Failed to load more products'))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, loading, hasMore, page, category, search]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return { products, total, loading, loadingMore, hasMore, sentinelRef };
}
