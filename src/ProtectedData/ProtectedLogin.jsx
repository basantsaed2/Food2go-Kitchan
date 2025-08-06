import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/Auth';

const ProtectedLogin = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const kitchen = auth.kitchen;

  useEffect(() => {
    if (kitchen && location.pathname === '/login') {
      navigate('/', { replace: true });
    } else if (!kitchen && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [kitchen, location.pathname, navigate]);

  return <Outlet />;
};

export default ProtectedLogin;