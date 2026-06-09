import api from './axios';
import type { AnalyticsStats } from '@/types';

export const analyticsApi = {
  getStats: (window = 60) =>
    api.get<AnalyticsStats>('/analytics/stats', { params: { window } }),
};
