import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Toaster } from "@/components/Toaster";
import { HomePage } from "@/pages/storefront/HomePage";
import { ProductsPage } from "@/pages/storefront/ProductsPage";
import { ProductDetailPage } from "@/pages/storefront/ProductDetailPage";
import { CartPage } from "@/pages/storefront/CartPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StorefrontLayout />}>
          <Route index element={<HomePage />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="produtos/:id" element={<ProductDetailPage />} />
          <Route path="carrinho" element={<CartPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
