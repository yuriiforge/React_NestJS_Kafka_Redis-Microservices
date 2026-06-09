import { useEffect } from 'react';
import { useOrdersStore } from '@/store/orders.store';
import type { Order } from '@/types';

const STATUS_LABEL: Record<Order['status'], string> = {
  PENDING:   'Pending',
  CONFIRMED: 'Processing',
  SHIPPED:   'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED:    'Failed',
};

const STATUS_COLORS: Record<Order['status'], string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  FAILED:    'bg-red-100 text-red-600',
};

const ACTIVE_STATUSES: Order['status'][] = ['PENDING', 'CONFIRMED', 'SHIPPED'];

export default function OrdersPage() {
  const { orders, loading, fetchOrders, subscribeToOrder } = useOrdersStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Subscribe to SSE for each active order
  useEffect(() => {
    const unsubs = orders
      .filter((o) => ACTIVE_STATUSES.includes(o.status))
      .map((o) => subscribeToOrder(o.id));
    return () => unsubs.forEach((fn) => fn());
  }, [orders.map((o) => o.id).join(',')]);

  const totalSpent = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const inProgress = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Orders</h1>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>

      <div className="px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders',  value: orders.length },
            { label: 'Total Spent',   value: `$${totalSpent.toFixed(2)}` },
            { label: 'In Progress',   value: inProgress },
            { label: 'Delivered',     value: delivered },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border px-4 py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border py-16 flex flex-col items-center gap-3 text-gray-400">
            <span className="text-4xl">📦</span>
            <p className="text-sm">No orders yet. Go shop!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Order ID', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">
                      {o.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{o.items.length}</td>
                    <td className="px-4 py-3 font-medium">${o.totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}
                      >
                        {STATUS_LABEL[o.status]}
                        {ACTIVE_STATUSES.includes(o.status) && (
                          <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
