import React, { createContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { removeKitchen, setKitchen, } from "../Store/CreateSlices";

// Create a context
const AuthContext = createContext();

export const ContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const kitchenData = useSelector((state) => state.kitchen.data);

  const [kitchen, setkitchenState] = useState(() => kitchenData || null);

  const login = (kitchenData) => {
    setkitchenState(kitchenData); // Update local state
    dispatch(setKitchen(kitchenData)); // Dispatch to Redux
    toast.success(`Welcome ${kitchenData?.kitchen?.name || '-'}`);
  };

  const logout = () => {
    setkitchenState(null);
    dispatch(removeKitchen()); // Remove from Redux
    localStorage.clear();
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        kitchen,
        login,
        logout,
        toastSuccess: (text) => toast.success(text),
        toastError: (text) => toast.error(text),
      }}
    >
      <ToastContainer />
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a ContextProvider");
  }
  return context;
};