import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Log from './pages/Log';
import History from './pages/History';

import Dashboard from './components/Dashboard';

/*
=========================================================
ROOT INDEX ROUTE
Unauthenticated -> Landing Page
Authenticated -> Redirect to /dashboard
=========================================================
*/
function RootIndex() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F8F6',
          color: '#5B6B65',
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px',
        }}
      >
        Initializing HonestBite AI...
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <Navigate to="/dashboard" replace />;
}

/*
=========================================================
PROTECTED LAYOUT
Displays Navbar on top for all authenticated pages
=========================================================
*/
function ProtectedLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

/*
=========================================================
APP ROUTER
=========================================================
*/
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =================================================
              PUBLIC LANDING / REDIRECT
          ================================================= */}
          <Route path="/" element={<RootIndex />} />

          {/* =================================================
              AUTH PAGE (LOGIN / SIGNUP)
          ================================================= */}
          <Route path="/auth" element={<Auth />} />

          {/* =================================================
              PROTECTED ROUTES
          ================================================= */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              {/* Dashboard is the primary home for authenticated users */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Single food logging page */}
              <Route path="/log" element={<Log />} />

              {/* History & Calendar page */}
              <Route path="/history" element={<History />} />

              {/* Profile editing form */}
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* =================================================
              FALLBACK ROUTE
          ================================================= */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}