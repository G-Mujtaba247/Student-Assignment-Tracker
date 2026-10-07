import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import { motion } from 'framer-motion';
import './Auth.css';

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('sat_token', response.data.token);
      localStorage.setItem('sat_user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="auth-page"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Floating decorative shapes */}
      <span className="auth-shape auth-shape--1" aria-hidden="true" />
      <span className="auth-shape auth-shape--2" aria-hidden="true" />
      <span className="auth-shape auth-shape--3" aria-hidden="true" />
      <span className="auth-shape auth-shape--4" aria-hidden="true" />

      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo" aria-hidden="true">🎓</div>
          <h1>Welcome back!</h1>
          <p>Sign in to manage your assignments</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="alert error" role="alert">
              <span>❌</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button" id="login-submit-btn">
            {loading ? (
              <>
                <span className="loading-spinner" />
                Signing in…
              </>
            ) : (
              <>
                <span>🔓</span> Sign in
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New here?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;
