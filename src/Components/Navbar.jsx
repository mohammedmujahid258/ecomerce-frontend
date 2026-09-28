import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between bg-gray-800 px-6 py-4 text-white">
      <h2 className="text-2xl font-bold">My Store</h2>

      <div className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">My Orders</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;