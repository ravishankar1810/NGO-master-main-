import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-[#004B8D] rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading your session…</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they have the wrong role
    if (user.role === 'ngo') return <Navigate to="/ngo-dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/donor-dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
