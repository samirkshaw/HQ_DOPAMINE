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
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
/*
=========================================================
ROOT INDEX ROUTE
Unauthenticated -> Landing Page
Authenticated -> Redirect to /dashboard
=========================================================
*/
function RootIndex() {
  const { user, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    let mounted = true;

    async function checkProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (mounted) {
        setHasProfile(!!data);
        setCheckingProfile(false);
      }
    }

    checkProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading || (user && checkingProfile)) {
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

  return <Navigate to={hasProfile ? '/dashboard' : '/profile'} replace />;
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