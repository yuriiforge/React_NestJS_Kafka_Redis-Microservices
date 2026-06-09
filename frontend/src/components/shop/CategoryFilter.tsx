const CATEGORIES = ['All', 'Electronics', 'Sports', 'Home', 'Accessories'];

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            selected === cat
              ? 'bg-black text-white border-black'
              : 'bg-white text-gray-600 border-gray-300 hover:border-black'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
