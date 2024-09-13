import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./features/eventSlice.js";
import userReducer from "./features/userSlice.js";

export const store = configureStore({
  reducer: {
    events: eventReducer,
    user: userReducer,
  },
});
