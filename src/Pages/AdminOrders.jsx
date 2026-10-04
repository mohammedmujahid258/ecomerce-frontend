
import { useEffect, useState } from "react";
import { api } from "../api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/all");

        console.log("Admin Orders", response.data);

        setOrders(response.data.orders);
      } catch (error) {
        console.log("Error fetching admin orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
    <div>
      <h1>Admin Orders</h1>

      {orders.map((order) => (
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


