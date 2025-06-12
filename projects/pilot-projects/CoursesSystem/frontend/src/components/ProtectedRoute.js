import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';

const ProtectedRoute = ({ children, roles }) => {
  const isAuthenticated = !!getToken();
  const user = getUser();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (roles && (!user || !roles.includes(user.role))) {
    // Redirect to role-appropriate dashboard
    if (user?.role === 'teacher' || user?.role === 'admin') {
      return <Navigate to="/dashboard" state={{ forbidden: true }} />;
    } else if (user?.role === 'student') {
      return <Navigate to="/dashboard" state={{ forbidden: true }} />;
    } else {
      return <Navigate to="/login" />;
    }
  }
  return children;
};

export default ProtectedRoute; 