export interface OrderStatsEvent {
  windowStart: string;
  ordersCount: number;
  totalRevenue: number;
  successRate: number;
  avgProcessingMs: number;
}
