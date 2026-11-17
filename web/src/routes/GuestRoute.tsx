import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  if (isAuthenticated) {
    if (redirect) {
      return <Navigate to={redirect} replace />;
    }
    if (user?.isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
