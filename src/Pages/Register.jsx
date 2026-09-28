
import { useState } from "react";
import {useNavigate} from "react-router-dom"
import {api} from "../api"

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate()


  const handleSubmit=async(e)=>{
    e.preventDefault();

    try{
        const response =await api.post("/users/register",{
          
            name,
            email,
            password
        });
        console.log("Register response:",response.data);
        navigate("/login");
    }
    catch(error){
        console.log("Register error :",error.response?.data)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Register
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block font-medium">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border px-4 py-2 outline-none"
            />
          </div>

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
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
