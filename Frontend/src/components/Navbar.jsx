import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, AUTH_STATES } from '../auth/AuthContext';
import ProfileModal from './ProfileModal';
import imdLogo from '../assets/branding/imd-logo.png';
import { useTheme } from '../utils/themeManager';
import { User, LogOut, HeartPulse, Wheat, Activity, Compass, Car, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { authState, currentUser, persona, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    const target = await logout();
    setShowProfile(false);
    navigate(target, { replace: true });
  };

  const isAuth = authState === AUTH_STATES.AUTHENTICATED || authState === AUTH_STATES.AUTHENTICATED_NO_PERSONA;

  const getPersonaBadge = (p) => {
    switch (p) {
      case 'fitness':
        return (
          <div className="persona-badge persona-fitness" id="nav-persona-badge">
            <Activity size={14} />
            <span>Fitness</span>
          </div>
        );
      case 'traveler':
        return (
          <div className="persona-badge persona-traveler" id="nav-persona-badge">
            <Compass size={14} />
            <span>Traveler</span>
          </div>
        );
      case 'commuter':
        return (
          <div className="persona-badge persona-commuter" id="nav-persona-badge">
            <Car size={14} />
            <span>Commuter</span>
          </div>
        );
      case 'health':
        return (
          <div className="persona-badge persona-health" id="nav-persona-badge">
            <HeartPulse size={14} />
            <span>Health</span>
          </div>
        );
      case 'agriculture':
      default:
        return (
          <div className="persona-badge persona-agriculture" id="nav-persona-badge">
            <Wheat size={14} />
            <span>Agriculture</span>
          </div>
        );
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          <Link to="/" className="brand-logo" id="nav-brand-logo">
            <img src={imdLogo} alt="IMD Mausam" className="nav-imd-logo" />
            <div className="brand-text-group">
              <span className="brand-name">{'\u092e\u094c\u0938\u092e'} MAUSAM</span>
              <span className="brand-tag">India Meteorological Department</span>
            </div>
          </Link>

          <nav className="header-nav">
            {/* Accessible Theme Toggle Button */}
            <button
              type="button"
              className="nav-theme-toggle-btn"
              id="nav-theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {isAuth ? (
              <div className="nav-auth-group">
                {persona && getPersonaBadge(persona)}

                <button
                  type="button"
                  className="nav-profile-btn"
                  id="nav-profile-button"
                  onClick={() => setShowProfile(true)}
                  title="View Profile & Settings"
                >
                  <div className="avatar-circle">
                    <User size={16} />
                  </div>
                  <span className="nav-user-name">
                    {currentUser?.displayName || currentUser?.name || currentUser?.email || 'My Account'}
                  </span>
                </button>

                <button
                  type="button"
                  className="nav-logout-btn"
                  id="nav-logout-button"
                  onClick={handleLogout}
                  title="Logout Session"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="nav-guest-group">
                <Link to="/login" className="btn btn-ghost" id="nav-login-link">
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary" id="nav-signup-link">
                  Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
