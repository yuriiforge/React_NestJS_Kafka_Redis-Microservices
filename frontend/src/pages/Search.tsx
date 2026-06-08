const statusColors: Record<string, string> = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
};

const results = [
  { id: 'ORD-047', user: 'alice@example.com', date: '2026-05-15', total: '$219.97', status: 'Delivered' },
  { id: 'ORD-058', user: 'alice@example.com', date: '2026-05-20', total: '$49.99',  status: 'Shipped' },
  { id: 'ORD-071', user: 'alice@example.com', date: '2026-05-24', total: '$84.98',  status: 'Processing' },
];

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Order Search</h1>
        <p className="text-sm text-gray-400 mt-0.5">Search and inspect any order across all users</p>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">
        {/* Search bar */}
        <div className="bg-white rounded-xl border p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by order ID, user email or product name..."
              className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              defaultValue="alice@example.com"
            />
            <button className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select className="border rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-black">
              <option>All statuses</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <input
              type="date"
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="date"
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <p className="text-sm font-medium">Results</p>
            <p className="text-xs text-gray-400">3 orders found</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order ID', 'User', 'Date', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{o.id}</td>
                  <td className="px-4 py-3 text-gray-500">{o.user}</td>
                  <td className="px-4 py-3 text-gray-500">{o.date}</td>
                  <td className="px-4 py-3 font-medium">{o.total}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-gray-500 hover:text-black underline">Details</button>
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
