import { create } from 'zustand';

interface CartItem {
  id: string;
}

interface UserCartStore {
  productsTotal: number;
  productIds: CartItem[];
  lastViewed: CartItem | null;

  addProduct: (id: string) => void;
  removeProduct: (id: string) => void;
  setLastViewed: (id: string) => void;
  clearCart: () => void;
}

export const useUserCartStore = create<UserCartStore>((set, get) => ({
  productsTotal: 0,
  productIds: [],
  lastViewed: null,

  addProduct: (id) => {
    const already = get().productIds.some((p) => p.id === id);
    if (!already) {
      set((s) => ({ productIds: [...s.productIds, { id }], productsTotal: s.productsTotal + 1 }));
    }
  },

  removeProduct: (id) =>
    set((s) => ({
      productIds: s.productIds.filter((p) => p.id !== id),
      productsTotal: s.productsTotal - 1,
    })),

  setLastViewed: (id) => set({ lastViewed: { id } }),

  clearCart: () => set({ productIds: [], productsTotal: 0 }),
}));
