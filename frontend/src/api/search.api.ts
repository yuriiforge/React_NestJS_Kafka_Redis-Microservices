import api from './axios';
import type { OrderSearchResponse, OrderSearchDoc } from '@/types';

export interface OrderSearchParams {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const searchApi = {
  orders: (params: OrderSearchParams) =>
    api.get<OrderSearchResponse>('/search', { params }),

  getOrder: (id: string) =>
    api.get<OrderSearchDoc>(`/search/orders/${id}`),

  stats: () =>
    api.get('/search/stats'),
};
