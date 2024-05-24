import { useSelector } from "react-redux";
const Bagsummary=()=>{




  let bagitems=useSelector(store=>store.bag)
  let items=useSelector(store=>store.item)
  const finalitems=items.filter(item=>{
    const itemindex=bagitems.indexOf(item.id);
    return itemindex>=0;
  })

 const CONVENIENCE_FEE=99;
 let totalmrp=0;
 let totaldiscount=0;

 finalitems.map((item)=>{
  totalmrp+=item.original_price;
  totaldiscount+=item.current_price;
 })

 let finalpayment=totalmrp-totaldiscount;
    const bagsummary={
        totalItem:items.length,
        totalMRP:totalmrp,
        totalDiscount:totaldiscount,
        finalPayment:finalpayment
    }
    return  <div className="bag-summary">
      {console.log(items)}
    <div className="bag-details-container">
    <div className="price-header">PRICE DETAILS ({bagsummary.totalItem} Items) </div>
    <div className="price-item">
      <span className="price-item-tag">Total MRP</span>
      <span className="price-item-value">₹{bagsummary.totalMRP}</span>
    </div>
    <div className="price-item">
      <span className="price-item-tag">Discount on MRP</span>
      <span className="price-item-value priceDetail-base-discount">-₹{bagsummary.totalDiscount}</span>
    </div>
    <div className="price-item">
      <span className="price-item-tag">CONVENIENCE FEE</span>
      <span className="price-item-value">₹{CONVENIENCE_FEE}</span>
    </div>
    <hr/>
    <div className="price-footer">
      <span className="price-item-tag">Total Amount</span>
      <span className="price-item-value">₹{bagsummary.finalPayment}</span>
    </div>
  </div>
  <button className="btn-place-order">
    <div className="css-xjhrni">PLACE ORDER</div>
  </button>
  </div>
}

export default Bagsummary;