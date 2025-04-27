import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteIfGuestProps {
  children: React.ReactNode;
}

const ProtectedRouteIfGuest: React.FC<ProtectedRouteIfGuestProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/events" />;
  }

  return <>{children}</>;
};

export default ProtectedRouteIfGuest;
