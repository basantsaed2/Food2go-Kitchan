import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './index.css';

const App = () => {
  return (
    <div className=" w-full h-screen relative">
      <Outlet />
    </div>
  )
}

export default App;
