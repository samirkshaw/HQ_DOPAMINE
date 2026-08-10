import React from 'react';
import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const {
    user,
    loading,
  } = useAuth();

  /*
  =========================================================
  WAIT FOR SUPABASE
  =========================================================
  */

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090d',
          color: '#94a3b8',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '15px',
        }}
      >
        Checking your account...
      </div>
    );
  }

  /*
  =========================================================
  NOT LOGGED IN
  =========================================================
  */

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  /*
  =========================================================
  LOGGED IN
  =========================================================
  */

  return <Outlet />;
}