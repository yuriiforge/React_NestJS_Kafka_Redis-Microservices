import { useUserCartStore } from '@/store/user-cart.store';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onCartOpen: () => void;
}

export function ShopHeader({ search, onSearchChange, onCartOpen }: Props) {
  const { count } = useUserCartStore();
  const cartCount = count();

  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Shop</h1>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black w-56"
        />
        <button onClick={onCartOpen} className="relative p-2 rounded-lg hover:bg-gray-100">
          <span className="text-lg">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
