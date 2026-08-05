import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

export default function Header({ title, subtitle, user, showAdminLink, showBackLink, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('sat_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sat_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu  = () => setMenuOpen(false);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <header className="page-header">
      <span className="header-blob header-blob--1" aria-hidden="true" />
      <span className="header-blob header-blob--2" aria-hidden="true" />

      <div className="header-content">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">🎓</div>
          <div className="header-text">
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        </div>

        <nav className="header-nav desktop-nav" aria-label="Main navigation">
          {showBackLink && (
            <button
              className="nav-btn secondary"
              onClick={() => navigate('/')}
              title="Back to dashboard"
              id="nav-back-btn"
            >
              <span className="nav-icon">←</span>
              <span className="nav-label">Dashboard</span>
            </button>
          )}

          <button
            className="nav-btn secondary theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="nav-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          {showAdminLink && user?.role === 'admin' && (
            <button
              className="nav-btn secondary"
              onClick={() => navigate('/admin')}
              title="Admin dashboard"
              id="nav-admin-btn"
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Admin</span>
            </button>
          )}
          {user && (
            <div className="user-info">
              <span className="user-avatar-chip">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-name truncate">{user.name}</span>
            </div>
          )}
          <button
            className="nav-btn secondary"
            onClick={onLogout}
            title="Logout"
            id="nav-logout-btn"
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        <div className="mobile-actions">
          <button
            className="nav-btn secondary theme-toggle-btn mobile-theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="nav-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          <button
            className={`hamburger ${menuOpen ? 'is-open' : ''}`}
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            id="nav-hamburger-btn"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              aria-hidden="true"
            />
            <motion.nav
              className="mobile-drawer"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              {user && (
                <div className="mobile-user">
                  <span className="user-avatar-chip user-avatar-chip--lg">{user.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <p className="mobile-user__name">{user.name}</p>
                    <p className="mobile-user__role">{user.role === 'admin' ? '⚙️ Administrator' : '👤 Student'}</p>
                  </div>
                </div>
              )}
              {showBackLink && (
                <button
                  className="mobile-nav-btn"
                  onClick={() => { navigate('/'); closeMenu(); }}
                  id="mobile-nav-back-btn"
                >
                  <span>←</span> Back to Dashboard
                </button>
              )}
              {showAdminLink && user?.role === 'admin' && (
                <button
                  className="mobile-nav-btn"
                  onClick={() => { navigate('/admin'); closeMenu(); }}
                  id="mobile-nav-admin-btn"
                >
                  <span>⚙️</span> Admin Dashboard
                </button>
              )}
              <button
                className="mobile-nav-btn danger"
                onClick={() => { onLogout(); closeMenu(); }}
                id="mobile-nav-logout-btn"
              >
                <span>🚪</span> Logout
              </button>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
