import { ACTIVE_STATUSES } from '@/hooks/useOrders';
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

interface Props {
  status: Order['status'];
}

export function OrderStatusBadge({ status }: Props) {
  const isActive = ACTIVE_STATUSES.includes(status);
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABEL[status]}
      {isActive && (
        <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
    </span>
  );
}
