import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup';
  
  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsSignUp(searchParams.get('mode') === 'signup');
  }, [searchParams]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ color: '#5B6B65', fontSize: '15px' }}>Initializing authentication...</div>
      </div>
    );
  }

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

  const toggleMode = (signupState) => {
    setIsSignUp(signupState);
    setError('');
    setMessage('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerNav}>
        <Link to="/" style={styles.brandLink}>
          <span style={styles.brandBadge}>HQ</span>
          <span style={styles.brandName}>DOPAMINE</span>
        </Link>
      </div>

      <div className="glass-card" style={styles.card}>
        <h1 style={styles.title}>
          {isSignUp ? 'Create your Account' : 'Welcome Back'}
        </h1>
        <p style={styles.subtitle}>
          {isSignUp
            ? 'Start tracking your meals with honest AI insight.'
            : 'Sign in to access your daily targets and meal logs.'}
        </p>

        {/* Mode Switch Tabs */}
        <div style={styles.tabGroup}>
          <button
            type="button"
            onClick={() => toggleMode(false)}
            style={{
              ...styles.tabBtn,
              ...(!isSignUp ? styles.tabBtnActive : {}),
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            style={{
              ...styles.tabBtn,
              ...(isSignUp ? styles.tabBtnActive : {}),
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}
        {message && <div style={styles.successMessage}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="glass-input"
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
              className="glass-input"
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
              : (isSignUp ? 'Create Account →' : 'Sign In →')}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={() => toggleMode(!isSignUp)}
              style={styles.toggleButton}
            >
              {isSignUp ? 'Sign In' : 'Sign Up free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
  },
  headerNav: {
    position: 'absolute',
    top: '24px',
    left: '24px',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  brandBadge: {
    backgroundColor: '#1F9E76',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '12px',
    padding: '3px 7px',
    borderRadius: '6px',
  },
  brandName: {
    fontFamily: "var(--font-display)",
    fontSize: '19px',
    fontWeight: '700',
    color: '#10241E',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '36px 28px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
  },
  title: {
    margin: '0 0 6px 0',
    fontFamily: "var(--font-display)",
    fontSize: '28px',
    fontWeight: '700',
    textAlign: 'center',
    color: '#10241E',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    textAlign: 'center',
    color: '#5B6B65',
    lineHeight: '1.5',
  },
  tabGroup: {
    display: 'flex',
    backgroundColor: 'rgba(16, 36, 30, 0.06)',
    padding: '4px',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  tabBtn: {
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#5B6B65',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    color: '#10241E',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#10241E',
  },
  button: {
    marginTop: '6px',
    padding: '14px',
    borderRadius: '999px',
    border: 'none',
    backgroundColor: '#1F9E76',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 4px 14px rgba(31, 158, 118, 0.25)',
    transition: 'all 0.2s ease',
  },
  errorMessage: {
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#dc2626',
    fontSize: '13px',
  },
  successMessage: {
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '10px',
    backgroundColor: 'rgba(31, 158, 118, 0.1)',
    border: '1px solid rgba(31, 158, 118, 0.25)',
    color: '#1F9E76',
    fontSize: '13px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontSize: '14px',
    color: '#5B6B65',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#1F9E76',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0 4px',
    fontSize: '14px',
    textDecoration: 'underline',
  },
};