import {configureStore} from '@reduxjs/toolkit';
import itemslice from './Itemslice';
import bagslice from './bag';

const myntrasstore=configureStore({
    reducer:{
        item:itemslice.reducer,
        bag:bagslice.reducer
    }
})

export default myntrasstore;

