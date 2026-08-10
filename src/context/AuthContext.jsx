import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      console.log('[Auth] Starting session check...');

      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        console.log('[Auth] getSession result:', {
          session: data?.session,
          error,
        });

        if (!mounted) {
          return;
        }

        if (error) {
          console.error(
            '[Auth] Supabase session error:',
            error
          );

          setSession(null);
          setUser(null);
        } else {
          const currentSession = data?.session ?? null;

          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (error) {
        console.error(
          '[Auth] Auth initialization error:',
          error
        );

        if (!mounted) {
          return;
        }

        setSession(null);
        setUser(null);
      } finally {
        if (mounted) {
          console.log('[Auth] Session check finished.');
          setLoading(false);
        }
      }
    }

    initializeAuth();

    /*
    =========================================================
    AUTH STATE LISTENER
    =========================================================
    */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(
          '[Auth] Auth state changed:',
          event,
          currentSession
        );

        if (!mounted) {
          return;
        }

        setSession(currentSession ?? null);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    /*
    =========================================================
    CLEANUP
    =========================================================
    */

    return () => {
      mounted = false;

      subscription?.unsubscribe();
    };
  }, []);

  /*
  =========================================================
  SIGN UP
  =========================================================
  */

  async function signUp(email, password) {
    console.log('[Auth] Signing up:', email);

    return await supabase.auth.signUp({
      email,
      password,
    });
  }

  /*
  =========================================================
  SIGN IN
  =========================================================
  */

  async function signIn(email, password) {
    console.log('[Auth] Signing in:', email);

    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  /*
  =========================================================
  SIGN OUT
  =========================================================
  */

  async function signOut() {
    console.log('[Auth] Signing out...');

    return await supabase.auth.signOut();
  }

  /*
  =========================================================
  CONTEXT VALUE
  =========================================================
  */

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
=========================================================
USE AUTH
=========================================================
*/

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
}