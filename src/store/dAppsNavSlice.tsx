import { createSlice } from '@reduxjs/toolkit';

const dAppsNavSlice = createSlice({
  name: 'dAppsNav',
  initialState: 'Home',
  reducers: {
    setdAppsNav: (state, action) => action.payload,
  },
});

export const { setdAppsNav } = dAppsNavSlice.actions;

export default dAppsNavSlice.reducer;
