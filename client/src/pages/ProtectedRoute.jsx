import React from 'react';
import { useUser } from '../utils/Providers';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { accessToken, isHydrating } = useUser();

  if (isHydrating) {
    // Show nothing or a global spinner while restoring session
    return null; 
  }

  // If hydration is done and we STILL don't have a token, redirect to login
  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

