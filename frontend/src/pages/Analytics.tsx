import { useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAnalyticsStore } from '@/store/analytics.store';

const PIE_COLORS = ['#22c55e', '#ef4444'];

export default function AnalyticsPage() {
  const { stats, history, startPolling } = useAnalyticsStore();

  useEffect(() => {
    const stop = startPolling(10_000);
    return stop;
  }, []);

  const pieData = stats
    ? [
        { name: 'Success', value: stats.successCount },
        { name: 'Failed',  value: stats.failedCount },
      ]
    : [];

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.allTimeOrders ?? '—',
      sub: 'all time',
    },
    {
      label: 'Total Revenue',
      value: stats ? `$${stats.allTimeRevenue.toFixed(2)}` : '—',
      sub: 'all time',
    },
    {
      label: 'Average Order',
      value: stats ? `$${stats.avgOrderValue.toFixed(2)}` : '—',
      sub: 'per order',
    },
    {
      label: 'Payment Time',
      value: stats ? `${stats.avgPaymentTimeSeconds}s` : '—',
      sub: `last ${stats?.windowSeconds ?? 60}s window`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            All-time totals · live window refreshes every 10 s
          </p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
          Live
        </span>
      </div>

      <div className="px-6 py-8 flex flex-col gap-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border px-5 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Line chart – orders / min */}
          <div className="lg:col-span-2 bg-white rounded-xl border p-5">
            <p className="text-sm font-medium mb-1">Orders / min</p>
            <p className="text-xs text-gray-400 mb-4">60 s rolling window, sampled every 10 s</p>
            {history.length < 2 ? (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                Collecting data…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={192}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders/min"
                    stroke="#000"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart – payment success rate */}
          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm font-medium mb-1">Payment Success Rate</p>
            <p className="text-xs text-gray-400 mb-4">
              {stats ? `${(stats.successRate * 100).toFixed(0)}% success` : 'No data yet'}
            </p>
            {(stats?.ordersCount ?? 0) === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                No payments in window
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={192}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconSize={10} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment breakdown */}
        {stats && stats.ordersCount > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm font-medium mb-1">Payment breakdown</p>
            <p className="text-xs text-gray-400 mb-4">Last {stats.windowSeconds}s window</p>
            <div className="flex flex-col gap-3 max-w-md">
              {[
                { label: 'Successful', count: stats.successCount,   color: 'bg-green-500' },
                { label: 'Failed',     count: stats.failedCount,    color: 'bg-red-500'   },
                { label: 'Delivered',  count: stats.deliveredCount, color: 'bg-purple-500' },
              ].map((row) => {
                const pct = stats.ordersCount > 0
                  ? Math.round((row.count / stats.ordersCount) * 100)
                  : 0;
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{row.label}</span>
                      <span>{row.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${row.color} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
