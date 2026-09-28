import {useState} from "react";
import axios from "axios"
function Login(){
    const [email,setEmail]=useState("")
    const[password,setPassword]=useState("");

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
          const response=await axios.post("/api/v1/auth/login",{
            email,
            password
              })
          localStorage.setItem("token",response.data.token)
          console.log("Login response :",response.data)
        }
        catch(error){
          console.log("Login error :",error.response?.data)

        }

    };
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Login
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border px-4 py-2 outline-none"
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border px-4 py-2 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
