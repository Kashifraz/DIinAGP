import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Header component
export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="modern-header">
      <div className="container">
        <div className="header-content">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="logo">
            <svg className="logo-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <path fill="url(#logoGradient)" d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
            </svg>
            <span className="logo-text">JobFlow</span>
          </Link>
          
          <nav className="main-nav">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                  Dashboard
                </Link>
                <Link to="/jobs" className="nav-link">
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  Jobs
                </Link>
                <Link to="/applications" className="nav-link">
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  Applications
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.22-13h-.06c-.4 0-.72.32-.72.72v4.72c0 .35.18.68.49.86l4.15 2.49c.34.2.78.1 1.03-.26.26-.36.18-.86-.17-1.09l-3.69-2.23V7.72c0-.4-.32-.72-.72-.72z"/>
                  </svg>
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Register
                </Link>
              </>
            )}
          </nav>

          {isAuthenticated && (
            <div className="user-section">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {user?.profile?.firstName || 'User'}
                    {user?.verificationBadge && <span className="verified-badge">✓</span>}
                  </span>
                  <span className="user-role">{user?.role}</span>
                </div>
              </div>
              <div className="user-actions">
                <Link to="/profile" className="profile-link" title="Profile">
                  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </Link>
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Footer component
export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p>&copy; 2024 Job Application Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Sidebar component
export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <nav>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/applications">Applications</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

// Loading component
export const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

// Error component
export const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="error-message">
      <span>{message}</span>
      {onClose && <button onClick={onClose}>×</button>}
    </div>
  );
};

// Success component
export const SuccessMessage = ({ message, onClose }) => {
  return (
    <div className="success-message">
      <span>{message}</span>
      {onClose && <button onClick={onClose}>×</button>}
    </div>
  );
};
