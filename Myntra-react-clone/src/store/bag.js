import {createSlice} from '@reduxjs/toolkit'
const bagslice=createSlice({
    name:'bag',
    initialState:[],
    reducers:{
        addtobag:(store,action)=>{
       store.push(action.payload);
        },
        removefrombag:(store,action)=>{
           return store.filter((item)=>item!=action.payload)
        }
    }
});

export const bagactions=bagslice.actions;

export default bagslice;