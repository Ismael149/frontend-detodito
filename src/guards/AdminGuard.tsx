import React from 'react';
import { Redirect } from 'react-router-dom';
import { authService } from '../services/authService';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdmin = authService.isAdmin();
  
  console.log('AdminGuard - Es admin:', isAdmin);
  
  if (!isAdmin) {
    console.log('AdminGuard - Redirigiendo a /store');
    return <Redirect to="/store" />;
  }

  return <>{children}</>;
};

export default AdminGuard;