import { useState } from 'react';
import { useShopProducts } from '@/hooks/useShopProducts';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { CategoryFilter } from '@/components/shop/CategoryFilter';
import { ProductCard } from '@/components/shop/ProductCard';
import { CartSidebar } from '@/components/shop/CartSidebar';

export default function ShopPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const { products, total, loading, loadingMore, hasMore, sentinelRef } = useShopProducts(
    category,
    search,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader
        search={search}
        onSearchChange={setSearch}
        onCartOpen={() => setCartOpen(true)}
      />

      <div className="px-6 py-8">
        <CategoryFilter selected={category} onChange={setCategory} />

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Loading…</div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">{total} products</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div ref={sentinelRef} className="py-4 flex justify-center">
              {loadingMore && <span className="text-sm text-gray-400">Loading more…</span>}
              {!loadingMore && !hasMore && products.length > 0 && (
                <span className="text-xs text-gray-300">All {total} products loaded</span>
              )}
            </div>
          </>
        )}
      </div>

      {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
    </div>
  );
}
