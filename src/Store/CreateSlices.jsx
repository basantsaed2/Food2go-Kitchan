import { createSlice } from "@reduxjs/toolkit";

// Initial states
const initialKitchenState = { data: null };

/*  kitchen */
const kitchenSlice = createSlice({
       name: "kitchen",
       initialState: initialKitchenState,
       reducers: {
              setKitchen: (state, action) => {
                     state.data = action.payload;
              },
              removeKitchen: (state) => {
                     state.data = null;
              },
       },
});

export const { setKitchen, removeKitchen } = kitchenSlice.actions;

export const kitchenReducer = kitchenSlice.reducer;
