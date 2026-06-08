import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

const userNav = [
  { label: 'Shop', to: '/' },
  { label: 'Orders', to: '/orders' },
  { label: 'Product Search', to: '/product-search' },
];

const adminNav = [
  { label: 'Orders', to: '/orders' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Search', to: '/search' },
  { label: 'Products', to: '/products' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const { pathname } = useLocation();

  const navItems = isAdmin() ? adminNav : userNav;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-bold text-lg tracking-tight">
              MyShop
            </Link>
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.to
                      ? 'text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={clearTokens}
            className="cursor-pointer text-sm text-gray-500 hover:text-black transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t">
        <div className="px-6 py-4 flex items-center justify-between text-sm text-gray-400">
          <span>© 2026 MyShop. All rights reserved.</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
