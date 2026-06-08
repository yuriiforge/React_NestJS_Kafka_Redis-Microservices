const stats = [
  { label: 'Total Revenue',  value: '$48,320', change: '+12.5%', up: true },
  { label: 'Total Orders',   value: '1,284',   change: '+8.1%',  up: true },
  { label: 'Active Users',   value: '342',     change: '-2.3%',  up: false },
  { label: 'Avg Order Value',value: '$37.63',  change: '+4.7%',  up: true },
];

const recentOrders = [
  { id: 'ORD-091', user: 'alice@example.com', total: '$219.97', status: 'Delivered' },
  { id: 'ORD-092', user: 'bob@example.com',   total: '$84.98',  status: 'Processing' },
  { id: 'ORD-093', user: 'carol@example.com', total: '$49.99',  status: 'Pending' },
  { id: 'ORD-094', user: 'dave@example.com',  total: '$309.96', status: 'Shipped' },
];

const statusColors: Record<string, string> = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Platform overview · last 30 days</p>
      </div>

      <div className="px-6 py-8 flex flex-col gap-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border px-5 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
              <p className={`text-xs mt-1 font-medium ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                {s.change} vs prev. period
              </p>
            </div>
          ))}
        </div>

        {/* Chart placeholder row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl border p-5">
            <p className="text-sm font-medium mb-4">Revenue over time</p>
            <div className="h-48 bg-gray-50 rounded-lg flex items-end gap-2 px-4 pb-4">
              {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-black rounded-t opacity-80" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
              {['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <p className="text-sm font-medium mb-4">Orders by status</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Delivered',  pct: 58, color: 'bg-green-500' },
                { label: 'Shipped',    pct: 20, color: 'bg-purple-500' },
                { label: 'Processing', pct: 14, color: 'bg-blue-500' },
                { label: 'Pending',    pct: 8,  color: 'bg-yellow-400' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{row.label}</span>
                    <span>{row.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <p className="text-sm font-medium">Recent Orders</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order ID', 'User', 'Total', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{o.id}</td>
                  <td className="px-4 py-3 text-gray-500">{o.user}</td>
                  <td className="px-4 py-3 font-medium">{o.total}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
