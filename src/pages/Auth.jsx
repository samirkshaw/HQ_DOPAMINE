import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Added 'loading' destructuring here
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // 1. Wait for Supabase to finish checking the session
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ color: '#94a3b8', fontSize: '16px' }}>Initializing...</div>
      </div>
    );
  }

  // 2. If already logged in, redirect immediately
  if (user) {
    return <Navigate replace to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await signUp(email, password);
        if (signUpError) throw signUpError;

        if (data?.user && !data?.session) {
          setMessage('Account created! Please check your email for confirmation if required.');
        } else {
          setMessage('Account created successfully!');
          navigate('/');
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setMessage('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>HQ DOPAMINE</h1>
        <h2 style={styles.subtitle}>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>

        {error && <div style={styles.errorMessage}>{error}</div>}
        {message && <div style={styles.successMessage}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.button,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting
              ? (isSignUp ? 'Creating account...' : 'Signing in...')
              : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={toggleMode}
              style={styles.toggleButton}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ... Keep your existing styles object here ...
const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  card: { width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '12px', backgroundColor: '#1e293b', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid #334155' },
  title: { margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', textAlign: 'center', letterSpacing: '1px', color: '#38bdf8' },
  subtitle: { margin: '0 0 24px 0', fontSize: '18px', fontWeight: '500', textAlign: 'center', color: '#94a3b8' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#cbd5e1' },
  input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '15px', outline: 'none' },
  button: { marginTop: '8px', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontSize: '16px', fontWeight: '600' },
  errorMessage: { padding: '10px 12px', marginBottom: '16px', borderRadius: '6px', backgroundColor: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', fontSize: '14px' },
  successMessage: { padding: '10px 12px', marginBottom: '16px', borderRadius: '6px', backgroundColor: '#14532d', border: '1px solid #166534', color: '#86efac', fontSize: '14px' },
  footer: { marginTop: '20px', textAlign: 'center' },
  footerText: { margin: 0, fontSize: '14px', color: '#94a3b8' },
  toggleButton: { background: 'none', border: 'none', color: '#38bdf8', fontWeight: '600', cursor: 'pointer', padding: '0 4px', fontSize: '14px', textDecoration: 'underline' }
};