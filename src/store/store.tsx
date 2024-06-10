import { configureStore } from '@reduxjs/toolkit';
import dAppsNavReducer from './dAppsNavSlice';

const store = configureStore({
  reducer: {
    dAppsNav: dAppsNavReducer,
  },
});

export default store;
