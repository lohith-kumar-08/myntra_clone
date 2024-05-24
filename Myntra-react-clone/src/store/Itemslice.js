import {createSlice} from '@reduxjs/toolkit'
const itemslice=createSlice({
    name:'item',
    initialState:[] ,
    reducers:{
        additems:(store,action)=>{
     return action.payload;
        }
    }
});

export const itemsactions=itemslice.actions;

export default itemslice;