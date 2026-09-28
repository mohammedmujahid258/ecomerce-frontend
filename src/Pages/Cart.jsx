import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function Cart() {
  const navigate=useNavigate()
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Cart response:", response.data);

        setCart(response.data.cart);
      } catch (error) {
        console.log("Error fetching Cart:", error);

        if (error.response?.status === 401) {
          setError("Please log in to view your cart.");
        } else if (error.code === "ERR_NETWORK") {
          setError(
            "Unable to connect to the server. Please start the backend and try again."
          );
        } else {
          setError("Unable to load your cart. Please try again.");
        }
      }
    };

    fetchCart();
  }, []);

  // Change quantity
  const changeQuantity = async (
    productId,
    direction,
    currentQuantity
  ) => {
    try {
      const newQuantity =
        direction === "increase"
          ? currentQuantity + 1
          : currentQuantity - 1;

      if (newQuantity < 1) {
        return;
      }

      const response = await api.put("/cart", {
        productId,
        quantity: newQuantity,
      });

      setCart(response.data.cart);
    } catch (error) {
      console.log("Error updating quantity:", error);
    }
  };

  // Remove product
  const removeItem = async (productId) => {
    try {
      const response = await api.delete("/cart", {
        data: {
          productId,
        },
      });

      setCart(response.data.cart);
    } catch (error) {
      console.log("Error removing item:", error);
    }
  };

  // Loading
  if (!cart) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading cart...
        </p>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = cart.items.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  // Error
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-md">
          <p className="text-lg font-semibold text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">

        {/* Heading */}
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          My Cart
        </h1>

        {/* Empty Cart */}
        {cart.items.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-md">
            <p className="text-xl text-gray-600">
              Your cart is empty.
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-5">
              {cart.items.map((item) => (
                <div
                  key={item.product._id}
                  className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    {/* Product Information */}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {item.product.name}
                      </h2>

                      <p className="mt-2 text-lg font-medium text-gray-700">
                        Price: ₹{item.product.price}
                      </p>

                      <p className="mt-1 text-gray-500">
                        Subtotal: ₹
                        {item.product.price * item.quantity}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3">

                      {/* Decrease */}
                      <button
                        onClick={() =>
                          changeQuantity(
                            item.product._id,
                            "decrease",
                            item.quantity
                          )
                        }
                        className="rounded-lg bg-gray-200 px-4 py-2 text-lg font-bold text-gray-700 transition hover:bg-gray-300"
                      >
                        −
                      </button>

                      {/* Quantity */}
                      <span className="min-w-10 text-center text-lg font-semibold">
                        {item.quantity}
                      </span>

                      {/* Increase */}
                      <button
                        onClick={() =>
                          changeQuantity(
                            item.product._id,
                            "increase",
                            item.quantity
                          )
                        }
                        className="rounded-lg bg-gray-200 px-4 py-2 text-lg font-bold text-gray-700 transition hover:bg-gray-300"
                      >
                        +
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() =>
                          removeItem(item.product._id)
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-8 rounded-xl bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Total
                </h2>

                <p className="text-2xl font-bold text-green-600">
                  ₹{totalPrice}
                </p>
                <button
                          onClick={() => navigate("/checkout")}
                          className="mt-4 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                          Proceed to Checkout
                  </button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;