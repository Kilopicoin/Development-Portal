import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  DappsNav: 'Home',
  MarketingNav: 'Home',
  ExchangesNav: 'Home'
};

const globalSlice = createSlice({
  name: 'globalSlice',
  initialState,
  reducers: {
    setDappsNav: (state, action) => {
      state.DappsNav = action.payload;
    },
    setMarketingNav: (state, action) => {
      state.MarketingNav = action.payload;
    },
    setExchangesNav: (state, action) => {
      state.ExchangesNav = action.payload;
    },
  },
});

export const { setDappsNav, setMarketingNav, setExchangesNav } = globalSlice.actions;

export default globalSlice.reducer;
