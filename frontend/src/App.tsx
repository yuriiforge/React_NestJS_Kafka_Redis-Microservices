import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import AuthPage from '@/pages/Auth';
import ShopPage from '@/pages/Shop';
import OrdersPage from '@/pages/Orders';
import AnalyticsPage from '@/pages/Analytics';
import SearchPage from '@/pages/Search';
import ProductSearchPage from '@/pages/ProductSearch';
import AdminProductsPage from '@/pages/AdminProducts';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated() ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAuthenticated()) return <Navigate to="/auth" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function UserOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAuthenticated()) return <Navigate to="/auth" replace />;
  if (isAdmin()) return <Navigate to="/orders" replace />;
  return <>{children}</>;
}

// / — users see ShopPage, admins are redirected to /orders
function RootRoute() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated()) return <Navigate to="/auth" replace />;
  if (isAdmin()) return <Navigate to="/orders" replace />;
  return <ShopPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />

        {/* User home -> Shop | Admin home -> /orders */}
        <Route path="/" element={<RootRoute />} />

        {/* User + Admin */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/analytics"
          element={
            <AdminRoute>
              <AnalyticsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/search"
          element={
            <AdminRoute>
              <SearchPage />
            </AdminRoute>
          }
        />
        <Route
          path="/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />

        {/* User only */}
        <Route
          path="/product-search"
          element={
            <UserOnlyRoute>
              <ProductSearchPage />
            </UserOnlyRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
