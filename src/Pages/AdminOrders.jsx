
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/all");
        console.log("Admin Orders", response.data);
        setOrders(response.data.orders || []);
      } catch (error) {
        console.log("Error fetching admin orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && (order.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = (order._id || "").toLowerCase().includes(q);
        const nameMatch = (order.user?.name || "").toLowerCase().includes(q);
        const emailMatch = (order.user?.email || "").toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !emailMatch) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleStatusChange=async(orderId,newStatus)=>{
    try{
      const response=await api.patch(
        `/orders/${orderId}/status`,
        {
          status:newStatus,
        }
      );
      console.log("Order status updated:",response.data)
      setOrders((previousOrder)=>
      previousOrder.map((orders)=>
      orders._id===orderId
      ?response.data.order
      :orders
    
    )
  )
    }catch(error){
      console.log("Error updatinf order status:",error)
    }
  }



  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer orders and update delivery statuses.
          </p>
        </div>
        <span className="self-start sm:self-auto rounded-full bg-white border border-gray-200 px-4 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
          Showing {filteredOrders.length} of {orders.length} Orders
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Order Search */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, customer name or email..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-amber-400 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#202016] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="text-3xl">📦</span>
          <p className="mt-2 text-sm font-bold text-gray-700">No orders match this filter.</p>
          {(statusFilter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        filteredOrders.map((order) => (
        <div
          key={order._id}
          className="mb-6 rounded-xl bg-white p-6 shadow-md"
        >
          <h2 className="text-xl font-bold">
            Order ID: {order._id}
          </h2>

          <div className="mt-4">
            <h3 className="font-semibold">Customer</h3>

            <p>Name: {order.user?.name}</p>
            <p>Email: {order.user?.email}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Products</h3>

            {order.items.map((item) => (
              <div
                key={item._id}
                className="mt-2 rounded-lg bg-gray-100 p-3"
              >
                <p>Product: {item.product?.name}</p>
                <p>Price: ₹{item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 font-semibold">
            Total: ₹{order.totalAmount}
          </p>

         <select
  value={order.status}
  onChange={(e) =>
    handleStatusChange(order._id, e.target.value)
  }
  className="mt-3 rounded-lg border px-3 py-2"
>
  <option value="pending">Pending</option>
  <option value="confirmed">Confirmed</option>
  <option value="shipped">Shipped</option>
  <option value="delivered">Delivered</option>
  <option value="cancelled">Cancelled</option>
</select>
        </div>
      ))}
    </div>
  );
}

export default AdminOrders;


