import { useEffect, useState } from "react";
import { api } from "../api";

function Orders(){
    const [orders,setOrder]=useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(()=>{
        const fetchOrders=async()=>{
            try{
                const response=await api.get("/orders");
                console.log("Orders response",response.data);
                setOrder(response.data.orders ?? response.data.data ?? []);
            }catch(error){
                console.log("Error fetching orders :",error)
                setError("Unable to load your orders. Please log in and try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [])

    const getPaymentStatus = (order) => {
      // Payment and order status are separate fields in many APIs.
      // Prefer the payment status when it is available, then fall back
      // to the order status returned by the backend.
      return (
        order.paymentStatus ??
        order.payment?.status ??
        order.payment?.paymentStatus ??
        order.status ??
        "pending"
      );
    };

     return (
    <div>
      <h1>My Orders</h1>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div key={order._id}>
          <p>Order ID: {order._id}</p>
          <p>Total: ₹{order.totalAmount}</p>
          <p>Status: {getPaymentStatus(order)}</p>
          {(order.items ?? []).map((item) => (
          <div key={item._id}>
          <p>Product: {item.product?.name ?? "Product unavailable"}</p>
         <p>Quantity: {item.quantity}</p>
        </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Orders;
