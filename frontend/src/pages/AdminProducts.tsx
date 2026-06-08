import { useState } from 'react';

const initialProducts = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 89.99,  stock: 42, active: true },
  { id: 2, name: 'Running Shoes',        category: 'Sports',      price: 129.99, stock: 18, active: true },
  { id: 3, name: 'Coffee Maker',         category: 'Home',        price: 59.99,  stock: 7,  active: true },
  { id: 4, name: 'Backpack',             category: 'Accessories', price: 49.99,  stock: 25, active: false },
  { id: 5, name: 'Desk Lamp',            category: 'Home',        price: 34.99,  stock: 31, active: true },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleActive(id: number) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  }

  function deleteProduct(id: number) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your product catalogue</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
          + Add product
        </button>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: products.length.toString() },
            { label: 'Active',         value: products.filter((p) => p.active).length.toString() },
            { label: 'Out of Stock',   value: products.filter((p) => p.stock === 0).length.toString() },
            { label: 'Low Stock',      value: products.filter((p) => p.stock > 0 && p.stock < 10).length.toString() },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border px-4 py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b flex items-center gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black w-64"
            />
            <select className="border rounded-lg px-3 py-1.5 text-sm text-gray-600 outline-none ml-auto">
              <option>All categories</option>
              <option>Electronics</option>
              <option>Sports</option>
              <option>Home</option>
              <option>Accessories</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3">${p.price}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock < 10 ? 'text-orange-500 font-medium' : ''}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(p.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        p.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
}
