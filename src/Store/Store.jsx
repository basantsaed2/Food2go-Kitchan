import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { kitchenReducer } from "./CreateSlices";
import { combineReducers } from "redux";

const reducers = combineReducers({
  kitchen: kitchenReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["kitchen"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const StoreApp = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(StoreApp);