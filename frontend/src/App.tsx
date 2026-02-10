import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { MainLayout } from './components/layout';
import { MarketplaceLayout } from './components/marketplace';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage, RegisterPage } from './pages/auth';
import { DashboardPage } from './pages/dashboard';
import { ProductsPage } from './pages/products';
import { CategoriesPage } from './pages/categories';
import { CustomersPage } from './pages/customers';
import { OrdersPage } from './pages/orders';
import { 
  HomePage, 
  ProductsListPage, 
  ProductPage, 
  CartPage, 
  CheckoutPage 
} from './pages/marketplace';
import { 
  SellerLayout, 
  SellerDashboard, 
  SellerProducts, 
  SellerOrders,
  SellerAnalytics,
  SellerSettings
} from './pages/seller';
import { useAuthStore } from './store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <div className="flex min-h-screen w-full flex-col">
            <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Marketplace (Public) Routes */}
            <Route element={<MarketplaceLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsListPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <CheckoutPage />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* Seller Panel (Protected) Routes */}
            <Route
              path="/seller"
              element={
                <PrivateRoute>
                  <SellerLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<SellerDashboard />} />
              <Route path="products" element={<SellerProducts />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="analytics" element={<SellerAnalytics />} />
              <Route path="settings" element={<SellerSettings />} />
            </Route>

            {/* Admin Panel (Protected) Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
