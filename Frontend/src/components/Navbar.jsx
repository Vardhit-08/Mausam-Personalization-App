import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AUTH_STATES } from '../auth/authStorage';
import ProfileModal from './ProfileModal';
import { CloudSun, User, LogOut, HeartPulse, Wheat, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { authState, currentUser, persona, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    const target = logout();
    setShowProfile(false);
    navigate(target, { replace: true });
  };

  const isAuth = authState === AUTH_STATES.AUTHENTICATED || authState === AUTH_STATES.AUTHENTICATED_NO_PERSONA;

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          <Link to="/" className="brand-logo" id="nav-brand-logo">
            <div className="logo-icon-box">
              <CloudSun className="logo-icon" size={26} />
            </div>
            <div className="brand-text-group">
              <span className="brand-name">Mausam</span>
              <span className="brand-tag">Personalization</span>
            </div>
          </Link>

          <nav className="header-nav">
            {isAuth ? (
              <div className="nav-auth-group">
                {persona && (
                  <div className={`persona-badge persona-${persona}`} id="nav-persona-badge">
                    {persona === 'health' ? (
                      <>
                        <HeartPulse size={15} />
                        <span>Health Mode</span>
                      </>
                    ) : (
                      <>
                        <Wheat size={15} />
                        <span>Agri Mode</span>
                      </>
                    )}
                  </div>
                )}

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
                    {currentUser.name || currentUser.email || 'My Account'}
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
