import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { CloudSun, Mail, Lock, ArrowRight, AlertCircle, Info } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Call centralized login
    // Returns '/dashboard' if existing persona exists, else '/persona'
    const targetRoute = login({ email });
    navigate(targetRoute, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo-link">
              <div className="logo-icon-box">
                <CloudSun size={28} />
              </div>
              <span className="auth-brand-name">Mausam</span>
            </Link>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to access your personalized weather insights</p>
          </div>

          <div className="mock-demo-notice">
            <Info size={16} className="notice-icon" />
            <span>Frontend demo session: Password is mock-validated.</span>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot?
                </Link>
              </div>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" id="login-submit-btn">
              <span>Sign In</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-inline-link" id="login-to-signup-link">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
