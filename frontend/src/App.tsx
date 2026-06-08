import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import Layout from '@/components/Layout';
import AuthPage from '@/pages/Auth';
import ShopPage from '@/pages/Shop';
import OrdersPage from '@/pages/Orders';
import AnalyticsPage from '@/pages/Analytics';
import SearchPage from '@/pages/Search';
import ProductSearchPage from '@/pages/ProductSearch';
import AdminProductsPage from '@/pages/AdminProducts';

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated() ? <Navigate to="/" replace /> : <>{children}</>;
}

function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated()) return <Navigate to="/auth" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  return isAdmin() ? <>{children}</> : <Navigate to="/" replace />;
}

function UserOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  return isAdmin() ? <Navigate to="/orders" replace /> : <>{children}</>;
}

function RootRoute() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  return isAdmin() ? <Navigate to="/orders" replace /> : <ShopPage />;
}

export default function App() {
  useRefreshToken();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />

        <Route element={<AuthLayout />}>
          <Route path="/" element={<RootRoute />} />
          <Route path="/orders" element={<OrdersPage />} />

          <Route path="/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
          <Route path="/search" element={<AdminRoute><SearchPage /></AdminRoute>} />
          <Route path="/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />

          <Route path="/product-search" element={<UserOnlyRoute><ProductSearchPage /></UserOnlyRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
