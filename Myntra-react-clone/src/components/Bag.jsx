 import Bagsummary from "./Bagsummary";
import Bagitems from "./Bagitems";
import { useSelector } from "react-redux";
const Bag = () => {
  const bagitems=useSelector(store=>store.bag);
  const items=useSelector(store=>store.item)

  const finalitems=items.filter(item=>{
    const itemindex=bagitems.indexOf(item.id);
    return itemindex>=0;
  })

  return (
  <main>
        <div className="bag-page">
          <div className="bag-items-container">
           { finalitems.map((item)=>(  <Bagitems key={item.id} item={item}></Bagitems>))}     
          </div>
            <Bagsummary/>      
        </div>
      </main>
   
  );
};

export default Bag;
