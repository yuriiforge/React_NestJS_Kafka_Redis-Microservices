import { useEffect, useState } from 'react';
import { useOrdersStore } from '@/store/orders.store';
import type { Order } from '@/types';

export const ACTIVE_STATUSES: Order['status'][] = ['PENDING', 'CONFIRMED', 'SHIPPED'];

const PAGE_SIZE = 10;

export function useOrders() {
  const { orders, loading, total, totalPages, fetchOrders, subscribeToOrder } = useOrdersStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders(page, PAGE_SIZE);
  }, [page]);

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

  return { orders, loading, total, totalPages, page, setPage, totalSpent, inProgress, delivered };
}
