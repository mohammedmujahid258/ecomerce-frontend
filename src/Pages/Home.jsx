
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome to My Store
      </h1>

      <p className="mt-4 text-lg text-gray-600">
        Discover amazing products at great prices
      </p>

      <Link
        to="/products"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Explore Products
      </Link>
    </main>
  );
}

export default Home;
