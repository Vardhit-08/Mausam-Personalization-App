import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CloudSun, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
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
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">We will send mock recovery instructions to your email</p>
          </div>

          {submitted ? (
            <div className="reset-success-box">
              <CheckCircle2 size={40} className="success-icon" />
              <h4>Recovery Email Sent</h4>
              <p>In this demo application, password recovery is simulated. You can now return to login.</p>
              <Link to="/login" className="btn btn-primary btn-block">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" id="forgot-password-form">
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" id="reset-submit-btn">
                Send Reset Link
              </button>
            </form>
          )}

          <div className="auth-footer">
            <Link to="/login" className="auth-inline-link flex-center-link">
              <ArrowLeft size={16} />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
