import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [], redirectPath = '/login' }) {
  const { user, loading, isImpersonating } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  const hasRoleMatch = allowedRoles.length === 0 || allowedRoles.includes(user.role);
  const isSpecialUser = user.is_owner || isImpersonating;

  if (!hasRoleMatch && !isSpecialUser) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}
