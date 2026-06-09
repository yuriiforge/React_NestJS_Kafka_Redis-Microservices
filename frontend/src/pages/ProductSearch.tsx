import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '@/api/products.api';
import { useUserCartStore } from '@/store/user-cart.store';
import type { Product } from '@/types';

const CATEGORIES = ['All', 'Electronics', 'Sports', 'Home', 'Accessories'];

const EMOJI: Record<string, string> = {
  Electronics: '🎧', Sports: '👟', Home: '🏠', Accessories: '🎒',
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-xs">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  );
}

export default function ProductSearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { addProduct, items } = useUserCartStore();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      productsApi
        .list({ search: query, category: category !== 'All' ? category : undefined, limit: 50 })
        .then((res) => { setResults(res.data.items); setSearched(true); })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, category]);

  function handleAdd(p: Product) {
    addProduct({ id: p.id, name: p.name, price: p.price, stock: p.stock });
    toast.success(`${p.name} added to cart`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Find Products</h1>
        <p className="text-sm text-gray-400 mt-0.5">Search and filter our catalogue</p>
      </div>

      <div className="px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Category</p>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === c}
                    onChange={() => setCategory(c)}
                    className="rounded-full"
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black bg-white"
            autoFocus
          />

          {loading ? (
            <div className="flex justify-center py-20 text-gray-400 text-sm">Searching…</div>
          ) : !searched ? (
            <div className="flex justify-center py-20 text-gray-400 text-sm">Type to search</div>
          ) : results.length === 0 ? (
            <div className="flex justify-center py-20 text-gray-400 text-sm">No results for "{query}"</div>
          ) : (
            <>
              <p className="text-xs text-gray-400">{results.length} product{results.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((p) => {
                  const inCart = items.find((i) => i.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-3xl">
                        {EMOJI[p.category] ?? '📦'}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{p.category}</p>
                        <h3 className="font-medium text-gray-900 mt-0.5">{p.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Stars rating={4} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-lg font-semibold">${p.price.toFixed(2)}</span>
                        <button
                          onClick={() => handleAdd(p)}
                          disabled={p.stock === 0}
                          className={`text-xs px-3 py-1.5 rounded-lg ${
                            inCart
                              ? 'bg-green-100 text-green-700'
                              : 'bg-black text-white hover:bg-gray-800'
                          } disabled:opacity-40`}
                        >
                          {p.stock === 0 ? 'Out of stock' : inCart ? '✓ In cart' : 'Add to cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
