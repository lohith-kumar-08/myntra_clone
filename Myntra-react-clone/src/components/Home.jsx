import { useSelector } from "react-redux";
import Homeitems from "./Homeitems";
const Home=()=>{
    const items=useSelector(store=>store.item)
    return<div className="itemcontainer">
     {items.map((item)=>(
<Homeitems key={item.id} item={item}></Homeitems>
     ))}
   
     </div>
    
}

export default Home;