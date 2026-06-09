import api from './axios';
import type { Order, OrdersResponse } from '@/types';

export interface CreateOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export const ordersApi = {
  list: () =>
    api.get<OrdersResponse>('/orders'),

  get: (id: string) =>
    api.get<Order>(`/orders/${id}`),

  create: (items: CreateOrderItem[]) =>
    api.post<Order>('/orders', { items }),

  cancel: (id: string) =>
    api.patch<Order>(`/orders/${id}/cancel`),
};
