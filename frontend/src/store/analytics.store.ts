import { create } from 'zustand';
import { analyticsApi } from '@/api/analytics.api';
import type { AnalyticsStats } from '@/types';

export interface HistoryPoint {
  time: string;
  orders: number;
  revenue: number;
}

interface AnalyticsStore {
  stats: AnalyticsStats | null;
  history: HistoryPoint[];
  startPolling: (ms?: number) => () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  stats: null,
  history: [],

  startPolling: (ms = 10_000) => {
    const tick = async () => {
      try {
        const { data } = await analyticsApi.getStats(60);
        set((s) => ({
          stats: data,
          history: [
            ...s.history.slice(-19),
            { time: new Date().toLocaleTimeString(), orders: data.ordersCount, revenue: data.windowRevenue },
          ],
        }));
      } catch {}
    };

    tick();
    const id = setInterval(tick, ms);
    return () => clearInterval(id);
  },
}));
