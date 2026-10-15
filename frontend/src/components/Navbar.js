import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            📚 Campus Hub
          </Link>
        </div>

        {/* Desktop Navigation */}
        {user && (
          <div className="navbar-menu desktop-only">
            <Link 
              to="/resources" 
              className={`nav-link ${isActive('/resources') ? 'active' : ''}`}
            >
              {user.role === 'teacher' ? '📖 My Resources' : '🔍 Browse Resources'}
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              ⚙️ Account
            </Link>
          </div>
        )}

        {/* Right Side Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="theme-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          {user ? (
            <>
              {/* User Profile Badge - Desktop */}
              <div className="user-badge desktop-only">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">
                    {user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                  </span>
                </div>
              </div>

              {/* Logout Button - Desktop */}
              <button onClick={handleLogout} className="btn btn-outline btn-sm desktop-only">
                Logout
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-menu-toggle mobile-only"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm desktop-only">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && (
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <div className="user-badge-mobile">
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">
                  {user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mobile-menu-links">
            <Link 
              to="/resources" 
              className={`mobile-nav-link ${isActive('/resources') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="link-icon">
                {user.role === 'teacher' ? '📖' : '🔍'}
              </span>
              <span>{user.role === 'teacher' ? 'My Resources' : 'Browse Resources'}</span>
            </Link>
            <Link 
              to="/dashboard" 
              className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="link-icon">⚙️</span>
              <span>Account Settings</span>
            </Link>
          </div>

          <div className="mobile-menu-footer">
            <button onClick={handleLogout} className="btn btn-danger btn-full">
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
