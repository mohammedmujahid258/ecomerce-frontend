import { useEffect,useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api";

function AdminRoute({children}){
    const[loading,setLoading]=useState(true)
    const[isAdmin,setisAdmin]=useState(false);

    useEffect(()=>{
        const checkAdmin=async()=>{
            try{

                const response=await api.get("/users/profile");;
                if(response.data.user.role==="admin"){
                    setisAdmin(true);

                }

                
                }catch(error){
                    console.log("Admin check failed ",error)
                } finally{
                    setLoading(false)
                }
        };
        checkAdmin()
        

    },[]);

    if(loading){
        return <p>Checking admin access.. </p>
    }
    if(!isAdmin){
        return <Navigate to ="/login" replace/>
    }
    return children
}
export default AdminRoute

