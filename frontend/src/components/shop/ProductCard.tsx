import { useUserCartStore } from '@/store/user-cart.store';
import type { Product } from '@/types';

const EMOJI: Record<string, string> = {
  Electronics: '🎧',
  Sports: '👟',
  Home: '🏠',
  Accessories: '🎒',
};

interface Props {
  product: Product;
}

export function ProductCard({ product: p }: Props) {
  const { items, addProduct, increment, decrement } = useUserCartStore();
  const inCart = items.find((i) => i.id === p.id);

  return (
    <div className="bg-white rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="bg-gray-100 rounded-lg h-36 flex items-center justify-center text-4xl">
        {EMOJI[p.category] ?? '📦'}
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{p.category}</p>
        <h3 className="font-medium text-gray-900 mt-0.5">{p.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-lg font-semibold">${p.price.toFixed(2)}</span>
        {inCart ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => decrement(p.id)}
              className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 text-sm font-bold"
            >
              −
            </button>
            <span className="text-sm font-medium w-4 text-center">{inCart.quantity}</span>
            <button
              onClick={() => increment(p.id)}
              disabled={inCart.quantity >= p.stock}
              className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addProduct({ id: p.id, name: p.name, price: p.price, stock: p.stock })}
            disabled={p.stock === 0}
            className="bg-black text-white text-sm px-4 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40"
          >
            {p.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        )}
      </div>

      {p.stock > 0 && p.stock < 10 && (
        <p className="text-xs text-orange-500 font-medium">Only {p.stock} left</p>
      )}
    </div>
  );
}
