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
import Home from './pages/Home';
import Log from './pages/Log';
import TestPipeline from './pages/TestPipeline';

import Dashboard from './components/Dashboard';
import UploadPhoto from './components/UploadPhoto';

/*
=========================================================
INDEX ROUTE (LANDING VS HOME)
Unauthenticated -> Landing Page
Authenticated -> Navbar + Home Page
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
        Initializing HQ Dopamine...
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <>
      <Navbar />
      <Home />
    </>
  );
}

/*
=========================================================
PROTECTED LAYOUT
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
APP
=========================================================
*/
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =================================================
              ROOT INDEX (LANDING PAGE OR HOME)
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/log" element={<Log />} />
              <Route path="/upload" element={<UploadPhoto />} />
              <Route path="/test" element={<TestPipeline />} />
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