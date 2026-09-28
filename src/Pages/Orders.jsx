import { useEffect, useState } from "react";
import { api } from "../api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data.orders ?? response.data.data ?? []);
      } catch (requestError) {
        console.error("Error fetching orders:", requestError);
        setError("Unable to load your orders. Please log in and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getPaymentStatus = (order) =>
    order.paymentStatus ??
    order.payment?.status ??
    order.payment?.paymentStatus ??
    order.status ??
    "pending";

  return (
    <main className="min-h-screen bg-gray-100 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Purchase history
          </p>
          <h1 className="mt-2 text-4xl font-black text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-500">View your purchases and order status.</p>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-600">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-800">No orders found</p>
            <p className="mt-2 text-gray-500">Your purchases will appear here.</p>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const status = getPaymentStatus(order);

            return (
              <section key={order._id} className="rounded-2xl bg-white p-6 shadow-md">
                <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Order ID
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-gray-700">
                      {order._id}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold capitalize text-indigo-700">
                    {status}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {(order.items ?? []).map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col justify-between gap-2 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Product
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-gray-900">
                          {item.product?.name ?? "Product unavailable"}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-5">
                  <span className="font-semibold text-gray-500">Order total</span>
                  <span className="text-2xl font-black text-indigo-600">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Orders;
