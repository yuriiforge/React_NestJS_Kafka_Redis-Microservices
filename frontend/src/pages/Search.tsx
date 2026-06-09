import { useState, useEffect, useRef } from 'react';
import { searchApi } from '@/api/search.api';
import type { Product } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Electronics: 'bg-blue-100 text-blue-700',
  Sports:      'bg-green-100 text-green-700',
  Home:        'bg-yellow-100 text-yellow-700',
  Accessories: 'bg-purple-100 text-purple-700',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchApi
        .products(query, category || undefined)
        .then((res) => { setResults(res.data); setSearched(true); })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, category]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Product Search</h1>
        <p className="text-sm text-gray-400 mt-0.5">Full-text search via Elasticsearch</p>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">
        {/* Search bar */}
        <div className="bg-white rounded-xl border p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by product name or description…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All categories</option>
              <option>Electronics</option>
              <option>Sports</option>
              <option>Home</option>
              <option>Accessories</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <p className="text-sm font-medium">Results</p>
            {searched && (
              <p className="text-xs text-gray-400">{results.length} product{results.length !== 1 ? 's' : ''} found</p>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Searching…</div>
          ) : !searched ? (
            <div className="py-12 text-center text-gray-400 text-sm">Type to search products</div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No results for "{query}"</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Name', 'Category', 'Price', 'Stock', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[p.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className={p.stock < 10 ? 'text-orange-500 font-medium' : ''}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
