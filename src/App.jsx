import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";

import Home from "./Pages/Home.jsx";
import Products from "./Pages/Product.jsx";
import ProductDetails from "./Pages/ProductDetails.jsx";

import Wishlist from "./Pages/Wishlist.jsx";
import Cart from "./Pages/Cart.jsx";
import Checkout from "./Pages/Checkout.jsx";
import Orders from "./Pages/Orders.jsx";

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

  return (
    <>
      {!isAuthPage && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
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

      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;
