import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {RouterProvider} from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import Bag from './components/Bag.jsx'
import {Provider} from "react-redux"
import myntrasstore from './store/index.js'
import Home from './components/Home.jsx'
const router=createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
      {
        path:'/',
        element:<Home/>
      },{
      path:'/bag',
      element:<Bag/>
    }]
    }

])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={myntrasstore}>
   <RouterProvider router={router}/>
   </Provider>
  </React.StrictMode>,
)
