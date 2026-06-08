const products = [
  { id: 1, name: 'Wireless Headphones', price: 89.99, category: 'Electronics', stock: 42 },
  { id: 2, name: 'Running Shoes', price: 129.99, category: 'Sports', stock: 18 },
  { id: 3, name: 'Coffee Maker', price: 59.99, category: 'Home', stock: 7 },
  { id: 4, name: 'Backpack', price: 49.99, category: 'Accessories', stock: 25 },
  { id: 5, name: 'Desk Lamp', price: 34.99, category: 'Home', stock: 31 },
  { id: 6, name: 'Yoga Mat', price: 24.99, category: 'Sports', stock: 60 },
];

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Shop</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black w-56"
          />
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <span className="text-lg">🛒</span>
            <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'Electronics', 'Sports', 'Home', 'Accessories'].map((cat) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                cat === 'All'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="bg-gray-100 rounded-lg h-36 flex items-center justify-center text-4xl">
                📦
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{p.category}</p>
                <h3 className="font-medium text-gray-900 mt-0.5">{p.name}</h3>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-semibold">${p.price}</span>
                <button className="bg-black text-white text-sm px-4 py-1.5 rounded-lg hover:bg-gray-800">
                  Add to cart
                </button>
              </div>
              {p.stock < 10 && (
                <p className="text-xs text-orange-500 font-medium">Only {p.stock} left</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
