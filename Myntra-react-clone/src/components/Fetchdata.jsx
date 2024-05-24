import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { itemsactions } from "../store/Itemslice";
import { useState } from "react";
import Loading from "./Loading";

const Fetchdata=()=>{
    const[loading,setloading]=useState(true);
   const dispatch=useDispatch()
    useEffect(()=>{ 
        setloading(true)
            fetch("http://localhost:8080/items").then(response=>response.json()).then(({items})=>dispatch(itemsactions.additems(items)))
            setloading(false);
        
    
    },[])


    return<>
    {loading && <Loading></Loading>}
    </>
}
export default Fetchdata;