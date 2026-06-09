interface Props {
  totalOrders: number;
  totalSpent: number;
  inProgress: number;
  delivered: number;
}

export function OrdersSummary({ totalOrders, totalSpent, inProgress, delivered }: Props) {
  const stats = [
    { label: 'Total Orders', value: totalOrders },
    { label: 'Total Spent',  value: `$${totalSpent.toFixed(2)}` },
    { label: 'In Progress',  value: inProgress },
    { label: 'Delivered',    value: delivered },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border px-4 py-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
          <p className="text-2xl font-semibold mt-1">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
