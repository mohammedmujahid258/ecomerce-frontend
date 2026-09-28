
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedAddress,setSelectedAddress]=useState(null)
  const [couponcode,setCouponcode]=useState("")
  const[discount,setDiscount]=useState(0)
  const[finalAmount,setfinalAmount]=useState(0)
  const[couponMessage,setCouponMessage]=useState("")

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get("/cart");
        console.log("Checkout cart:", response.data);

        setCart(response.data.cart);
      } catch (error) {
        console.log("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, []);

  if (!cart) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading checkout...
        </p>
      </div>
    );
  }


  const totalPrice = cart.items.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );
      const handleSubmit= async()=>{
              const addressData={
                fullname:name,
                phone,
                street:address,
                city,
                state,
                pincode
              };
               const response=await api.post("/addresses",addressData)
               setSelectedAddress(response.data.address)
              console.log(response.data)

            }

      const handlePlaceOrder=async()=>{
       
       try{if(!selectedAddress){
          console.log("Please select addresss first ")
          return
        }
        const orderresponse=await api.post("/orders/create", {
          addressId: selectedAddress._id,
          couponCode:couponcode || undefined,
        });
        console.log("Order response :",orderresponse.data);
        const orderId=orderresponse.data.order._id;

        const paymentResponse=await api.post("/payments",{
          orderId:orderId,
          paymentMethod:"MOCK",
        });
        console.log("Payment reponse :",paymentResponse.data);
        const paymentId=paymentResponse.data.payment._id;

      // complete mock payment
      const mockPaymentResponse=await api.post(`/payments/${paymentId}/mock-success`)
      console.log("Mock payment response:",mockPaymentResponse.data)

      // go the order after successfull payment 
        navigate("/orders")

    }
     catch(error){
        console.log("Payment/order error",error)
      }
  }
     
    

      const handleApplyCoupon=async()=>{
        try{
          const response=await api.post("/coupons/apply",{
            code:couponcode,
            orderAmount:totalPrice,
          })
          setDiscount(response.data.discount);
          setfinalAmount(response.data.finalAmount);
          setCouponMessage(response.data.message)
          console.log("Order response :",response.data)
        }catch(error){
          console.log("Coupon error:",error)
          setDiscount(0);
          setfinalAmount(totalPrice);
          setCouponMessage(
            error.response?.data?.message || "Unable to apply  coupon "
          )
        }
      }


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
  

        {/* Checkout Heading */}
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Checkout
        </h1>

        {/* Cart Items */}
        <div className="rounded-xl bg-white p-6 shadow-md">

          <h2 className="mb-5 text-2xl font-bold">
            Your Items
          </h2>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {item.product.name}
                  </h3>

                  <p className="text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{item.product.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 flex justify-between border-t pt-5">
            <h2 className="text-xl font-bold">
              Total
            </h2>

            <p className="text-xl font-bold text-green-600">
              ₹{totalPrice}
            </p>
          </div>

        </div>

        {/* Delivery Address */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-md">

          <h2 className="mb-5 text-2xl font-bold">
            Delivery Address
          </h2>

          <div className="space-y-4">

            {/* Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            />

            {/* Phone */}
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            />

            {/* Address */}
            <textarea
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
              rows="3"
            />

            {/* City */}
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            />

            {/* State */}
            <input
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            />

            {/* Pincode */}
            <input
              type="text"
              placeholder="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            />

          </div>
            <button
            type="button"
          onClick={handleSubmit}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Submit Address
          </button>
          <div className="mt-6 rounded-lg bg-white p-6 shadow">
  <h2 className="mb-4 text-xl font-bold">Apply Coupon</h2>

  <div className="flex gap-3">
      <input 
      type="text"
      placeholder="Enter coupon code"
      value={couponcode}
      onChange={(e) => setCouponcode(e.target.value)}
      className="flex-1 rounded border px-3 py-2"
    />

    <button
      onClick={handleApplyCoupon}
      className="rounded bg-blue-600 px-5 py-2 text-white"
    >
      Apply
    </button>
  </div>

  {couponMessage && (
    <p className="mt-2 text-sm text-green-600">
      {couponMessage}
    </p>
  )}
</div>
<div className="mt-6 rounded-lg bg-white p-6 shadow">
  <h2 className="mb-4 text-xl font-bold">
    Order Summary
  </h2>

  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>₹{totalPrice}</span>
  </div>

  <div className="mt-2 flex justify-between">
    <span>Discount</span>
    <span>- ₹{discount}</span>
  </div>

  <hr className="my-3" />

  <div className="flex justify-between text-lg font-bold">
    <span>Total</span>
    <span>₹{finalAmount || totalPrice}</span>
  </div>
</div>
          <button
          type="button"
          onClick={handlePlaceOrder}>Place Order</button>

        </div>

      </div>
    </div>
  );
}


export default Checkout;

