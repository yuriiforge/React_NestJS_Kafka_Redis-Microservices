import { useState, useEffect, useRef } from 'react';
import { searchApi } from '@/api/search.api';
import type { OrderSearchDoc } from '@/types';

const PAGE_SIZE = 10;

interface Results {
  items: OrderSearchDoc[];
  total: number;
  totalPages: number;
  loading: boolean;
  searched: boolean;
}

const DEFAULT_RESULTS: Results = {
  items: [], total: 0, totalPages: 0, loading: false, searched: false,
};

export function useOrderSearch() {
  const [params, setParams] = useState({ q: '', status: '', page: 1 });
  const [results, setResults] = useState<Results>(DEFAULT_RESULTS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults((s) => ({ ...s, loading: true }));
      searchApi
        .orders({
          q: params.q.trim() || undefined,
          status: params.status || undefined,
          page: params.page,
          limit: PAGE_SIZE,
        })
        .then((res) => setResults({
          items: res.data.items,
          total: res.data.total,
          totalPages: res.data.totalPages,
          loading: false,
          searched: true,
        }))
        .catch(() => setResults((s) => ({ ...s, items: [], loading: false, searched: true })));
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [params]);

  const setQuery  = (q: string)      => setParams((p) => ({ ...p, q, page: 1 }));
  const setStatus = (status: string) => setParams((p) => ({ ...p, status, page: 1 }));
  const setPage   = (page: number)   => setParams((p) => ({ ...p, page }));

  return { params, setQuery, setStatus, setPage, results };
}
