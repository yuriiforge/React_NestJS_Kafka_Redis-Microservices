import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUserCartStore } from '@/store/user-cart.store';
import { useOrdersStore } from '@/store/orders.store';

interface Props {
  onClose: () => void;
}

export function CartSidebar({ onClose }: Props) {
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const { items, removeProduct, increment, decrement, clearCart, total: cartTotal, count } =
    useUserCartStore();
  const placeOrder = useOrdersStore((s) => s.placeOrder);

  async function handleCheckout() {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      await placeOrder(
        items.map((i) => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      );
      clearCart();
      onClose();
      toast.success('Order placed!');
      navigate('/orders');
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-96 bg-white shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Cart ({count()})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-xl">
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
  );
}
