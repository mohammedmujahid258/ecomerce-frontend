import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import ToastContainer from "./Components/ToastContainer.jsx";

import Home from "./Pages/Home.jsx";
import Products from "./Pages/Product.jsx";
import ProductDetails from "./Pages/ProductDetails.jsx";

import Wishlist from "./Pages/Wishlist.jsx";
import Cart from "./Pages/Cart.jsx";
import Checkout from "./Pages/Checkout.jsx";
import Orders from "./Pages/Orders.jsx";
import OrderDetails from "./Pages/OrderDetails.jsx";
import Profile from "./Pages/Profile.jsx";

import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import AdminRoute from "./Components/AdminRoute.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";
import Adminproducts from "./Pages/Adminproduct.jsx";
import AdminOrders from "./Pages/AdminOrders.jsx";
import AdminUsers from "./Pages/AdminUsers.jsx";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f5] text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Show Navbar on all storefront pages */}
      {!isAuthPage && !isAdminPage && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Public customer routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected customer routes */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <Adminproducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products/all"
            element={
              <AdminRoute>
                <Adminproducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/all/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
        </Routes>
      </div>

      {/* Global Toast notifications */}
      <ToastContainer />

      {/* Show Footer on all storefront pages */}
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
}

export default App;
