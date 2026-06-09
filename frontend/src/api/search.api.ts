import api from './axios';
import type { Product } from '@/types';

export const searchApi = {
  products: (q: string, category?: string) =>
    api.get<Product[]>('/search', { params: { q, ...(category ? { category } : {}) } }),
};
