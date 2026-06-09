import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productsApi } from '@/api/products.api';
import { useUserCartStore } from '@/store/user-cart.store';
import { useOrdersStore } from '@/store/orders.store';
import type { Product } from '@/types';

const CATEGORIES = ['All', 'Electronics', 'Sports', 'Home', 'Accessories'];

const EMOJI: Record<string, string> = {
  Electronics: '🎧',
  Sports: '👟',
  Home: '🏠',
  Accessories: '🎒',
};

export default function ShopPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const { items, addProduct, removeProduct, increment, decrement, clearCart, total: cartTotal, count } = useUserCartStore();
  const placeOrder = useOrdersStore((s) => s.placeOrder);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ category: category !== 'All' ? category : undefined, search: search || undefined })
      .then((res) => {
        setProducts(res.data.items);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [category, search]);

  async function handleCheckout() {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      await placeOrder(
        items.map((i) => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      );
      clearCart();
      setCartOpen(false);
      toast.success('Order placed!');
      navigate('/orders');
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Shop</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black w-56"
          />
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            <span className="text-lg">🛒</span>
            {count() > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {count()}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Category filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === cat
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Loading…</div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">{total} products</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => {
                const inCart = items.find((i) => i.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                  >
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
                            className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100 text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addProduct({ id: p.id, name: p.name, price: p.price })}
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
              })}
            </div>
          </>
        )}
      </div>

      {/* Cart sidebar overlay */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setCartOpen(false)} />
          <div className="w-96 bg-white shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Cart ({count()})</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-black text-xl">
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Your cart is empty
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrement(item.id)}
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-xs hover:bg-gray-100"
                        >
                          −
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => increment(item.id)}
                          className="w-6 h-6 rounded-full border flex items-center justify-center text-xs hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeProduct(item.id)}
                        className="text-gray-300 hover:text-red-500 ml-1 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 border-t">
                  <div className="flex justify-between text-sm font-medium mb-4">
                    <span>Total</span>
                    <span>${cartTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={placing}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-60"
                  >
                    {placing ? 'Placing order…' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
