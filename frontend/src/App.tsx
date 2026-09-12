import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Toaster } from "@/components/Toaster";
import { RequireAuth } from "@/components/auth/Guards";
import { HomePage } from "@/pages/storefront/HomePage";
import { ProductsPage } from "@/pages/storefront/ProductsPage";
import { ProductDetailPage } from "@/pages/storefront/ProductDetailPage";
import { CartPage } from "@/pages/storefront/CartPage";
import { CheckoutPage } from "@/pages/storefront/CheckoutPage";
import { OrderSuccessPage } from "@/pages/storefront/OrderSuccessPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { MyOrdersPage } from "@/pages/account/MyOrdersPage";
import { OrderDetailPage } from "@/pages/account/OrderDetailPage";
import { ProfilePage } from "@/pages/account/ProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StorefrontLayout />}>
          {/* Loja pública */}
          <Route index element={<HomePage />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="produtos/:id" element={<ProductDetailPage />} />
          <Route path="carrinho" element={<CartPage />} />
          {/* Autenticação */}
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          {/* Exigem sessão */}
          <Route
            path="checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />
          <Route
            path="pedido/:id/sucesso"
            element={
              <RequireAuth>
                <OrderSuccessPage />
              </RequireAuth>
            }
          />
          <Route
            path="conta/pedidos"
            element={
              <RequireAuth>
                <MyOrdersPage />
              </RequireAuth>
            }
          />
          <Route
            path="conta/pedidos/:id"
            element={
              <RequireAuth>
                <OrderDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="conta/perfil"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
