import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Auth from './pages/Auth';
import Home from './pages/Home';
import Log from './pages/Log';
import TestPipeline from './pages/TestPipeline';

import Dashboard from './components/Dashboard';
import UploadPhoto from './components/UploadPhoto';

/*
=========================================================
PROTECTED LAYOUT
=========================================================

Everything inside ProtectedRoute will be authenticated.

Navbar is displayed on every protected page.
Outlet renders the currently selected protected page.
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
              PUBLIC ROUTES
          ================================================= */}

          <Route
            path="/auth"
            element={<Auth />}
          />


          {/* =================================================
              PROTECTED ROUTES
          ================================================= */}

          <Route element={<ProtectedRoute />}>

            <Route element={<ProtectedLayout />}>

              {/* Home */}
              <Route
                path="/"
                element={<Home />}
              />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              {/* Manual Food Log */}
              <Route
                path="/log"
                element={<Log />}
              />

              {/* AI Food Photo */}
              <Route
                path="/upload"
                element={<UploadPhoto />}
              />

              {/* Gemini Pipeline Test */}
              <Route
                path="/test"
                element={<TestPipeline />}
              />

            </Route>

          </Route>


          {/* =================================================
              UNKNOWN URL
          ================================================= */}

          <Route
            path="*"
            element={<Navigate to="/auth" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}