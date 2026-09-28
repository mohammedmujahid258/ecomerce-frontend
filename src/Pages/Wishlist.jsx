import {useEffect,useState} from "react"
import {api} from "../api";

function Wishlist(){
    const [products,setProducts]=useState([]);
    const [loading, setLoading]=useState(true);
    const[error,setError]=useState("");

    useEffect(()=>{
        const fetchWishlist=async()=>{
            try{
                const response=await api.get("/wishlist");
                console.log("response data :",response.data);
             
                setProducts(response.data.wishlist.products)
            }
            catch(error){
                console.log("error fetching wishlist : ",error)
                setError("unable to load wishlist")
            }
            finally{
                setLoading(false)
            }
        };
        fetchWishlist()
},[])
const removeFromWishlist=async(productId)=>{
    try{
        const response =await api.delete("/wishlist",{
            data:{productId},
        })
        console.log("Remove wishlist response:",response.data);
        setProducts(response.data.wishlist.products)
    }
    catch(error){
        console.log("error removing from wishlist",error)
    }
}
const addToCart=async(productId)=>{
    try{
        const response=await api.post("/cart",{
            productId:productId,
            quantity:1,
        })
        console.log("Add to cart response :",response.data)
    }catch(error){
        console.log('Error adding to cart :',error)
    }
}
if(loading){
    return <p className="p-6"> Loading wishlist..</p>
}
if(error){
    return <p className="p-6 text-red-600">{error}</p>
}
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">

        <h1 className="mb-8 text-3xl font-bold">
          My Wishlist ❤️
        </h1>

        {products.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <p className="text-xl text-gray-600">
              Your wishlist is empty.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-xl bg-white p-6 shadow-md"
              >
                <h2 className="text-xl font-bold">
                  {product.name}
                </h2>

                <p className="mt-2 text-gray-600">
                  {product.description}
                </p>

                <p className="mt-3 text-lg font-semibold">
                  ₹{product.price}
                </p>

                <p className="mt-1 text-gray-500">
                  Stock: {product.stock}
                </p>
                <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                    Remove from Wishlist
                </button>
                <button
                onClick={() => addToCart(product._id)}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                Add to Cart
              </button>
              </div>
              
            ))}

          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;