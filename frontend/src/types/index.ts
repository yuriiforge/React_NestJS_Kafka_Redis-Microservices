export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  createdAt: string;
}

export interface AnalyticsStats {
  windowSeconds: number;
  ordersCount: number;
  successCount: number;
  failedCount: number;
  deliveredCount: number;
  totalRevenue: number;
  successRate: number;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  totalPages: number;
}
