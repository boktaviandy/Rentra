import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../hooks/useAuth';

export function AppLayout() {
  const { currentTenant } = useAuth();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');

  if (!isSuperAdmin && !currentTenant) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
