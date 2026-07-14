import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import './Auth.css';

/* Password strength scorer */
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'Weak',   color: 'hsl(0,72%,51%)',   width: '20%' };
  if (score === 2) return { score, label: 'Fair',   color: 'hsl(38,92%,50%)',  width: '40%' };
  if (score === 3) return { score, label: 'Good',   color: 'hsl(38,72%,44%)',  width: '60%' };
  if (score === 4) return { score, label: 'Strong', color: 'hsl(142,72%,40%)', width: '80%' };
  return               { score, label: 'Very Strong', color: 'hsl(142,65%,32%)', width: '100%' };
}

function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(password);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('sat_token', response.data.token);
      localStorage.setItem('sat_user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Floating decorative shapes */}
      <span className="auth-shape auth-shape--1" aria-hidden="true" />
      <span className="auth-shape auth-shape--2" aria-hidden="true" />
      <span className="auth-shape auth-shape--3" aria-hidden="true" />
      <span className="auth-shape auth-shape--4" aria-hidden="true" />

      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo" aria-hidden="true">🎓</div>
          <h1>Create Account</h1>
          <p>Join to start tracking your assignments</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="alert error" role="alert">
              <span>❌</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
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
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="password-strength">
                <div className="strength-bar-track">
                  <div
                    className="strength-bar-fill"
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  />
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="auth-button" id="register-submit-btn">
            {loading ? (
              <>
                <span className="loading-spinner" />
                Creating account…
              </>
            ) : (
              <>
                <span>✨</span> Create account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
