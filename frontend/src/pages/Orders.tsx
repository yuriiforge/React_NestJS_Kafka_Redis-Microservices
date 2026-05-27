const statusColors: Record<string, string> = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
};

const orders = [
  { id: 'ORD-001', date: '2026-05-20', items: 3, total: 219.97, status: 'Delivered' },
  { id: 'ORD-002', date: '2026-05-22', items: 1, total: 129.99, status: 'Shipped' },
  { id: 'ORD-003', date: '2026-05-24', items: 2, total: 84.98,  status: 'Processing' },
  { id: 'ORD-004', date: '2026-05-26', items: 4, total: 309.96, status: 'Pending' },
  { id: 'ORD-005', date: '2026-05-27', items: 1, total: 24.99,  status: 'Pending' },
];

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Orders</h1>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders',   value: '5' },
            { label: 'Total Spent',    value: '$769.89' },
            { label: 'In Progress',    value: '2' },
            { label: 'Delivered',      value: '1' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border px-4 py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order ID', 'Date', 'Items', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{o.id}</td>
                  <td className="px-4 py-3 text-gray-500">{o.date}</td>
                  <td className="px-4 py-3 text-gray-500">{o.items}</td>
                  <td className="px-4 py-3 font-medium">${o.total}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-gray-500 hover:text-black underline">
                      View
                    </button>
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
