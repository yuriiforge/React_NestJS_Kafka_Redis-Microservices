import api from './axios';
import type { Product, ProductsResponse } from '@/types';

export interface ProductsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  isActive?: boolean;
}

export const productsApi = {
  categories: () =>
    api.get<string[]>('/products/categories'),

  list: (params?: ProductsParams) =>
    api.get<ProductsResponse>('/products', { params }),

  get: (id: string) =>
    api.get<Product>(`/products/${id}`),

  create: (data: ProductPayload) =>
    api.post<Product>('/products', data),

  update: (id: string, data: Partial<ProductPayload>) =>
    api.patch<Product>(`/products/${id}`, data),

  remove: (id: string) =>
    api.delete(`/products/${id}`),
};
