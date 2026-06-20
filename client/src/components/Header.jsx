import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ title, subtitle, user, showAdminLink, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="page-header">
      <div className="header-content">
        <div className="header-text">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <nav className="header-nav">
          {showAdminLink && user?.role === 'admin' && (
            <button 
              className="nav-btn secondary"
              onClick={() => navigate('/admin')}
              title="Admin dashboard"
            >
              <span className="icon">⚙️</span>
              Admin
            </button>
          )}
          {user && (
            <div className="user-info">
              <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user.name}</span>
            </div>
          )}
          <button 
            className="nav-btn secondary"
            onClick={onLogout}
            title="Logout"
          >
            <span className="icon">🚪</span>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
