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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="w-full max-w-md flex justify-start mb-6 sm:absolute sm:top-6 sm:left-6 sm:mb-0">
        <Link to="/" className="flex items-center text-decoration-none group" title="HonestBite AI Home">
          <img 
            src="/logo-full.svg" 
            alt="HonestBite AI" 
            className="h-8 sm:h-9 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-200" 
          />
        </Link>
      </div>

      <div className="glass-card w-full max-w-md p-6 sm:p-9 rounded-2xl">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-center text-[#10241E] mb-1.5">
          {isSignUp ? 'Create your Account' : 'Welcome Back'}
        </h1>
        <p className="text-xs sm:text-sm text-center text-[#5B6B65] mb-6 leading-relaxed">
          {isSignUp
            ? 'Start tracking your meals with honest AI insight.'
            : 'Sign in to access your daily targets and meal logs.'}
        </p>

        {/* Mode Switch Tabs */}
        <div className="flex bg-[#10241E]/6 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => toggleMode(false)}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              !isSignUp
                ? "bg-white text-[#10241E] shadow-xs"
                : "text-[#5B6B65] hover:text-[#10241E]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              isSignUp
                ? "bg-white text-[#10241E] shadow-xs"
                : "text-[#5B6B65] hover:text-[#10241E]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 text-xs sm:text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-[#1F9E76]/10 border border-[#1F9E76]/25 text-[#1F9E76] text-xs sm:text-sm font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#10241E]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="glass-input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#10241E]">Password</label>
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
            className="mt-1 w-full py-3 px-4 bg-[#1F9E76] text-white text-sm sm:text-base font-semibold rounded-full shadow-md hover:bg-[#178361] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? (isSignUp ? 'Creating account...' : 'Signing in...')
              : (isSignUp ? 'Create Account →' : 'Sign In →')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-[#5B6B65]">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={() => toggleMode(!isSignUp)}
              className="text-[#1F9E76] font-semibold underline cursor-pointer hover:text-[#178361]"
            >
              {isSignUp ? 'Sign In' : 'Sign Up free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}