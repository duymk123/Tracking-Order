import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage.jsx";
import { RegisterPage } from "../pages/RegisterPage.jsx";
import { ProductsPage } from "../pages/ProductsPage.jsx";
import { ProductDetailPage } from "../pages/ProductDetailPage.jsx";
import { CartPage } from "../pages/CartPage.jsx";
import { CheckoutPage } from "../pages/CheckoutPage.jsx";
import { MyOrdersPage } from "../pages/MyOrdersPage.jsx";
import { OrderDetailPage } from "../pages/OrderDetailPage.jsx";
import { SellerOrdersPage } from "../pages/SellerOrdersPage.jsx";
import { SellerOrderDetailPage } from "../pages/SellerOrderDetailPage.jsx";
import { ShipperOrdersPage } from "../pages/ShipperOrdersPage.jsx";
import { ShipperOrderDetailPage } from "../pages/ShipperOrderDetailPage.jsx";
import { ShipperProfilePage } from "../pages/ShipperProfilePage.jsx";
import { ReturnsManagementPage } from "../pages/ReturnsManagementPage.jsx";
import { InventoryPage } from "../pages/InventoryPage.jsx";
import { getStoredCredentials } from "../services/authStorage.js";
import { AppLayout } from "../layouts/AppLayout.jsx";

// Guard: chưa đăng nhập → về /login
function RequireAuth({ children }) {
  const creds = getStoredCredentials();
  if (!creds?.username) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Guarded({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* BUYER */}
      <Route path="/products" element={<Guarded><ProductsPage /></Guarded>} />
      <Route path="/products/:productId" element={<Guarded><ProductDetailPage /></Guarded>} />
      <Route path="/cart" element={<Guarded><CartPage /></Guarded>} />
      <Route path="/orders" element={<Guarded><MyOrdersPage /></Guarded>} />
      <Route path="/orders/:orderId" element={<Guarded><OrderDetailPage /></Guarded>} />
      <Route path="/checkout" element={<Guarded><CheckoutPage /></Guarded>} />

      {/* SELLER */}
      <Route path="/seller/orders" element={<Guarded><SellerOrdersPage /></Guarded>} />
      <Route path="/seller/orders/:orderId" element={<Guarded><SellerOrderDetailPage /></Guarded>} />
      <Route path="/seller/returns" element={<Guarded><ReturnsManagementPage /></Guarded>} />
      <Route path="/seller/inventory" element={<Guarded><InventoryPage /></Guarded>} />

      {/* SHIPPER */}
      <Route path="/shipper/orders" element={<Guarded><ShipperOrdersPage /></Guarded>} />
      <Route path="/shipper/orders/:orderId" element={<Guarded><ShipperOrderDetailPage /></Guarded>} />
      <Route path="/shipper/profile" element={<Guarded><ShipperProfilePage /></Guarded>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
