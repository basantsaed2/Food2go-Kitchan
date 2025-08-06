import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ProtectedLogin from "./ProtectedData/ProtectedLogin";
import LoginPage from "./Pages/Authentication/LoginPage";
import HomePage from "./Pages/Home/HomePage";

export const router = createBrowserRouter([
  {
    path: '',
    element: <App />,
    children: [
      {
        path: 'login',
        element: <ProtectedLogin />,
        children: [
          {
            path: '',
            element: <LoginPage />,
          },
        ],
      },
      {
        path: '/',
        element: <ProtectedLogin />,
        children: [
          {
            path: '',
            element: <HomePage />,
          },
        ],
      },
    ],
  },
]);