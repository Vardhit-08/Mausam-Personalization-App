import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { CloudSun, User, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup({ name: name.trim(), email: email.trim(), password });
      if (!res.success) {
        setError(res.error || 'Failed to create account.');
        setIsSubmitting(false);
        return;
      }
      navigate(res.targetRoute, { replace: true });
    } catch (err) {
      setError(err?.message || 'Signup failed.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.error || 'Google sign-up failed.');
        setIsSubmitting(false);
        return;
      }
      navigate(res.targetRoute, { replace: true });
    } catch (err) {
      setError(err?.message || 'Google sign-up failed.');
      setIsSubmitting(false);
    }
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
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">Join Mausam to receive persona-tailored weather advisories</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert" id="signup-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" id="signup-form">
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ankush Manekar"
                  required
                  autoComplete="name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 chars)"
                  required
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              id="signup-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary-outline btn-block"
              id="signup-google-btn"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
              style={{ marginTop: '0.75rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-inline-link" id="signup-to-login-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
