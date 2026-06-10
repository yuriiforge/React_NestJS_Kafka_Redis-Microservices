import type { Product } from '@/types';

interface Props {
  total: number;
  items: Product[];
}

export function ProductStatsCards({ total, items }: Props) {
  const stats = [
    { label: 'Total',        value: total },
    { label: 'Active',       value: items.filter((p) => p.isActive).length },
    { label: 'Out of stock', value: items.filter((p) => p.stock === 0).length },
    { label: 'Low stock',    value: items.filter((p) => p.stock > 0 && p.stock < 10).length },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border px-4 py-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
          <p className="text-2xl font-semibold mt-1">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
