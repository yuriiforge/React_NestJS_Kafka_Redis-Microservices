import { useOrders } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/auth.store';
import { OrdersSummary } from '@/components/orders/OrdersSummary';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { Pagination } from '@/components/Pagination';

export default function OrdersPage() {
  const { orders, loading, total, totalPages, page, setPage, totalSpent, inProgress, delivered } =
    useOrders();
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{isAdmin() ? 'All Orders' : 'My Orders'}</h1>
        <span className="text-sm text-gray-500">{total} orders</span>
      </div>

      <div className="px-6 py-8">
        <OrdersSummary
          totalOrders={total}
          totalSpent={totalSpent}
          inProgress={inProgress}
          delivered={delivered}
        />

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Loading…</div>
        ) : (
          <>
            <OrdersTable orders={orders} />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
