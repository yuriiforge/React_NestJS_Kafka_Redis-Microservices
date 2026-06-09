import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface UserCartStore {
  items: CartItem[];
  addProduct: (product: Omit<CartItem, 'quantity'>) => void;
  removeProduct: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useUserCartStore = create<UserCartStore>((set, get) => ({
  items: [],

  addProduct: (product) => {
    const existing = get().items.find((i) => i.id === product.id);
    if (existing) {
      set((s) => ({
        items: s.items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      }));
    } else {
      set((s) => ({ items: [...s.items, { ...product, quantity: 1 }] }));
    }
  },

  removeProduct: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  increment: (id) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    })),

  decrement: (id) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i,
      ),
    })),

  clearCart: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  count: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
