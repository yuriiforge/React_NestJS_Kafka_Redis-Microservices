import type { Product } from '@/types';

interface Props {
  items: Product[];
  loading: boolean;
  search: string;
  deleting: string | null;
  onSearchChange: (v: string) => void;
  onEdit: (p: Product) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
}

export function ProductTable({
  items, loading, search, deleting,
  onSearchChange, onEdit, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
}: Props) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center gap-3">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black w-64"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
      ) : (
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
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="text-lg">{p.emoji}</span>{p.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.category}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock < 10 ? 'text-orange-500 font-medium' : ''}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => onEdit(p)} className="text-xs text-blue-600 hover:underline">
                      Edit
                    </button>
                    {deleting === p.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Sure?</span>
                        <button onClick={() => onDeleteConfirm(p.id)} className="text-xs text-red-600 font-medium">Yes</button>
                        <button onClick={onDeleteCancel} className="text-xs text-gray-400">No</button>
                      </div>
                    ) : (
                      <button onClick={() => onDeleteRequest(p.id)} className="text-xs text-red-500 hover:underline">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && items.length === 0 && (
        <div className="py-12 text-center text-gray-400 text-sm">No products found</div>
      )}
    </div>
  );
}
