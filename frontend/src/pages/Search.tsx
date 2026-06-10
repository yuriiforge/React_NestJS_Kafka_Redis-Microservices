import { useOrderSearch } from '@/hooks/useOrderSearch';
import { Pagination } from '@/components/Pagination';

const ORDER_STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING',        label: 'Pending' },
  { value: 'CONFIRMED',      label: 'Preparing' },
  { value: 'SHIPPED',        label: 'Shipped' },
  { value: 'DELIVERED',      label: 'Delivered' },
  { value: 'FAILED',         label: 'Failed' },
  { value: 'CANCELLED',      label: 'Cancelled' },
  { value: 'payment_failed', label: 'Payment Failed' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:        'bg-gray-100 text-gray-600',
  CONFIRMED:      'bg-amber-100 text-amber-700',
  SHIPPED:        'bg-blue-100 text-blue-700',
  DELIVERED:      'bg-green-100 text-green-700',
  CANCELLED:      'bg-gray-100 text-gray-500',
  FAILED:         'bg-red-100 text-red-600',
  payment_failed: 'bg-red-100 text-red-600',
};

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED:  'bg-red-100 text-red-600',
};

export default function SearchPage() {
  const { params, setQuery, setStatus, setPage, results } = useOrderSearch();

  const statusLabel = (s: string) =>
    ORDER_STATUSES.find((o) => o.value === s)?.label ?? s;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Order Search</h1>
        <p className="text-sm text-gray-400 mt-0.5">Full-text search across all orders via Elasticsearch</p>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">
        <div className="bg-white rounded-xl border p-5 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by order ID, user ID, item name, courier…"
            value={params.q}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            autoFocus
          />
          <select
            value={params.status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-black"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {results.searched && (
          <p className="text-xs text-gray-400">{results.total} order{results.total !== 1 ? 's' : ''} found</p>
        )}

        {results.loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Searching…</div>
        ) : !results.searched ? (
          <div className="py-20 text-center text-sm text-gray-400">Showing all orders</div>
        ) : results.items.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">
            No orders found{params.q ? ` for "${params.q}"` : ''}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.items.map((o) => (
              <div key={o.orderId} className="bg-white rounded-xl border p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs text-gray-700 font-medium">{o.orderId.slice(0, 8)}…</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel(o.status)}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>User</span>
                    <span className="font-mono text-xs">{o.userId.slice(0, 8)}…</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Items</span>
                    <span>{o.itemCount}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${o.totalAmount.toFixed(2)}</span>
                  </div>
                  {o.courier && (
                    <div className="flex justify-between text-gray-500">
                      <span>Courier</span>
                      <span>{o.courier}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                  {o.paymentStatus && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${PAYMENT_COLORS[o.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {o.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.totalPages > 1 && (
          <Pagination page={params.page} totalPages={results.totalPages} onChange={setPage} />
        )}
      </div>
    </div>
  );
}
