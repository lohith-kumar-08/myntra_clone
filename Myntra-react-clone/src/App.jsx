import Header from "./components/Header"
import Footer from "./components/Footer"
import { Outlet } from "react-router-dom"
import Fetchdata from "./components/Fetchdata"
function App() {

 
  return (
    <>
     <Header></Header>
     <Fetchdata></Fetchdata> 
    <Outlet></Outlet>
    <Footer></Footer>
    </>
  )
}

export default App
