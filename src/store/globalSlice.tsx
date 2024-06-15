import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dAppsNav: 'Home',
  MarketingNav: 'Home',
  ExchangesNav: 'Home'
};

const globalSlice = createSlice({
  name: 'globalSlice',
  initialState,
  reducers: {
    setdAppsNav: (state, action) => {
      state.dAppsNav = action.payload;
    },
    setMarketingNav: (state, action) => {
      state.MarketingNav = action.payload;
    },
    setExchangesNav: (state, action) => {
      state.ExchangesNav = action.payload;
    },
  },
});

export const { setdAppsNav, setMarketingNav, setExchangesNav } = globalSlice.actions;

export default globalSlice.reducer;
