import { configureStore } from '@reduxjs/toolkit';
import globalSliceReducer from './globalSlice';

const store = configureStore({
  reducer: {
    global: globalSliceReducer,
  },
});

export default store;
