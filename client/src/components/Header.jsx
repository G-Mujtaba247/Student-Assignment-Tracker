import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ title, subtitle, user, showAdminLink, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu  = () => setMenuOpen(false);

  return (
    <header className="page-header">
      {/* Decorative blobs */}
      <span className="header-blob header-blob--1" aria-hidden="true" />
      <span className="header-blob header-blob--2" aria-hidden="true" />

      <div className="header-content">
        {/* Brand / Title */}
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">🎓</div>
          <div className="header-text">
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="header-nav desktop-nav" aria-label="Main navigation">
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

        {/* Hamburger — mobile only */}
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

      {/* Mobile Drawer */}
      <nav
        className={`mobile-drawer ${menuOpen ? 'is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
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
      </nav>
    </header>
  );
}
