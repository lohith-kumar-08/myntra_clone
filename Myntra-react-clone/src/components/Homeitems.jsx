import { useDispatch } from "react-redux";
import { bagactions } from "../store/bag";
import { useSelector } from "react-redux";
const Homeitems = ({ item }) => {
  const dispatch = useDispatch();
  const items=useSelector(store=>store.bag);
  const elementfound=items.indexOf(item.id)>=0;
  const handleaddbtn = (itemid) => {
    dispatch(bagactions.addtobag(itemid));
  };
  const handleremovebtn = (itemid) => {
    dispatch(bagactions.removefrombag(itemid));
  };

  return (
    <>
      <div className="item-container eachitem">
        <img className="item-image" src={item.image} alt="item image" />
        <div className="rating">
          {item.rating.stars} ⭐ | {item.rating.count}
        </div>
        <div className="company-name">{item.company}</div>
        <div className="item-name">{item.item_name}</div>
        <div className="price">
          <span className="current-price">Rs {item.current_price}</span>
          <span className="original-price">Rs {item.original_price}</span>
          <span className="discount">({item.discount_percentage}% OFF)</span>
        </div>
       {elementfound?<button className="btn btn-danger buttons" onClick={()=> handleremovebtn(item.id)}>
       remove from bag
        </button>:<button className="btn btn-primary buttons" onClick={()=> handleaddbtn(item.id)}>
          Add to Bag
        </button>} 
      </div>
    </>
  );
};

export default Homeitems;
