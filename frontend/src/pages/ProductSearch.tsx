const products = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 89.99, rating: 4.5, reviews: 128 },
  { id: 2, name: 'Running Shoes',        category: 'Sports',      price: 129.99, rating: 4.7, reviews: 84 },
  { id: 3, name: 'Coffee Maker',         category: 'Home',        price: 59.99, rating: 4.2, reviews: 203 },
  { id: 4, name: 'Backpack',             category: 'Accessories', price: 49.99, rating: 4.6, reviews: 57 },
  { id: 5, name: 'Desk Lamp',            category: 'Home',        price: 34.99, rating: 4.1, reviews: 91 },
  { id: 6, name: 'Yoga Mat',             category: 'Sports',      price: 24.99, rating: 4.8, reviews: 310 },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-xs">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  );
}

export default function ProductSearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Find Products</h1>
        <p className="text-sm text-gray-400 mt-0.5">Search and filter our catalogue</p>
      </div>

      <div className="px-6 py-8 flex gap-6">
        {/* Sidebar filters */}
        <aside className="w-52 shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Category</p>
            <div className="flex flex-col gap-2">
              {['All', 'Electronics', 'Sports', 'Home', 'Accessories'].map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded" defaultChecked={c === 'All'} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Price range</p>
            <div className="flex gap-2 items-center">
              <input type="number" placeholder="0" className="border rounded px-2 py-1 text-sm w-full outline-none" />
              <span className="text-gray-400 text-sm">–</span>
              <input type="number" placeholder="500" className="border rounded px-2 py-1 text-sm w-full outline-none" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Min rating</p>
            <div className="flex flex-col gap-1.5">
              {[4, 3, 2, 1].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="rating" />
                  <Stars rating={r} /> <span className="text-gray-500">& up</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Search input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black bg-white"
            />
            <select className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none bg-white">
              <option>Most relevant</option>
              <option>Price: low to high</option>
              <option>Price: high to low</option>
              <option>Best rated</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs text-gray-400">{products.length} products found</p>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-3xl">📦</div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{p.category}</p>
                  <h3 className="font-medium text-gray-900 mt-0.5">{p.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Stars rating={p.rating} />
                    <span className="text-xs text-gray-400">({p.reviews})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-semibold">${p.price}</span>
                  <button className="bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800">
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
