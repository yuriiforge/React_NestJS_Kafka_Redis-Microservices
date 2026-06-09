import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '@/types';

const HEADERS = ['Order ID', 'Date', 'Items', 'Total', 'Status'];

interface Props {
  orders: Order[];
}

export function OrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border py-16 flex flex-col items-center gap-3 text-gray-400">
        <span className="text-4xl">📦</span>
        <p className="text-sm">No orders yet. Go shop!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {HEADERS.map((h) => (
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
                <OrderStatusBadge status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
