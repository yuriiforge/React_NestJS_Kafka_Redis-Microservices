import { useState, useEffect, useRef } from 'react';
import { searchApi } from '@/api/search.api';
import { Pagination } from '@/components/Pagination';
import type { OrderSearchDoc } from '@/types';

const ORDER_STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING',        label: 'Pending' },
  { value: 'CONFIRMED',      label: 'Processing' },
  { value: 'SHIPPED',        label: 'Shipped' },
  { value: 'DELIVERED',      label: 'Delivered' },
  { value: 'FAILED',         label: 'Failed' },
  { value: 'CANCELLED',      label: 'Cancelled' },
  { value: 'payment_failed', label: 'Payment Failed' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:        'bg-yellow-100 text-yellow-700',
  CONFIRMED:      'bg-blue-100 text-blue-700',
  SHIPPED:        'bg-purple-100 text-purple-700',
  DELIVERED:      'bg-green-100 text-green-700',
  CANCELLED:      'bg-gray-100 text-gray-500',
  FAILED:         'bg-red-100 text-red-600',
  payment_failed: 'bg-red-100 text-red-600',
};

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED:  'bg-red-100 text-red-600',
};

const PAGE_SIZE = 10;

export default function SearchPage() {
  const [q, setQ]           = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);
  const [items, setItems]   = useState<OrderSearchDoc[]>([]);
  const [total, setTotal]   = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchApi
        .orders({ q: q.trim() || undefined, status: status || undefined, page, limit: PAGE_SIZE })
        .then((res) => {
          setItems(res.data.items);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
          setSearched(true);
        })
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [q, status, page]);

  function handleQueryChange(v: string) {
    setQ(v);
    setPage(1);
  }

  function handleStatusChange(v: string) {
    setStatus(v);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Order Search</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Full-text search across all orders via Elasticsearch
        </p>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">
        {/* Search controls */}
        <div className="bg-white rounded-xl border p-5 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by order ID, user ID, item name, courier…"
            value={q}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            autoFocus
          />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-black"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <p className="text-sm font-medium">Results</p>
            {searched && (
              <p className="text-xs text-gray-400">{total} order{total !== 1 ? 's' : ''} found</p>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Searching…</div>
          ) : !searched ? (
            <div className="py-12 text-center text-sm text-gray-400">Showing all orders</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No orders found{q ? ` for "${q}"` : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Order ID', 'User', 'Status', 'Total', 'Items', 'Courier', 'Payment', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((o) => (
                    <tr key={o.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {o.orderId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {o.userId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ORDER_STATUSES.find((s) => s.value === o.status)?.label ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        ${o.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-center">
                        {o.itemCount}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {o.courier ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {o.paymentStatus ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PAYMENT_COLORS[o.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                            {o.paymentStatus}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>
    </div>
  );
}
