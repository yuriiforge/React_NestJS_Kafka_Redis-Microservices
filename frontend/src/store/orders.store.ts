import { create } from 'zustand';
import { ordersApi, type CreateOrderItem } from '@/api/orders.api';
import type { Order } from '@/types';

const DELIVERY_TO_ORDER: Record<string, Order['status']> = {
  PREPARING: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
};

interface OrdersStore {
  orders: Order[];
  loading: boolean;
  total: number;
  totalPages: number;
  fetchOrders: (page?: number, limit?: number) => Promise<void>;
  placeOrder: (items: CreateOrderItem[]) => Promise<Order>;
  updateStatus: (orderId: string, deliveryStatus: string) => void;
  subscribeToOrder: (orderId: string) => () => void;
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],
  loading: false,
  total: 0,
  totalPages: 1,

  fetchOrders: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const res = await ordersApi.list({ page, limit });
      set({ orders: res.data.items, total: res.data.total, totalPages: res.data.totalPages });
    } finally {
      set({ loading: false });
    }
  },

  placeOrder: async (items) => {
    const res = await ordersApi.create(items);
    const order = res.data;
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  updateStatus: (orderId, deliveryStatus) => {
    const status = DELIVERY_TO_ORDER[deliveryStatus] ?? (deliveryStatus as Order['status']);
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  },

  subscribeToOrder: (orderId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return () => {};

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/orders/${orderId}/events`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
            signal: controller.signal,
          },
        );
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data:')) {
              try {
                const payload = JSON.parse(line.slice(5).trim());
                if (payload.status) get().updateStatus(orderId, payload.status);
              } catch {}
            }
          }
        }
      } catch {
        // aborted
      }
    })();

    return () => controller.abort();
  },
}));
