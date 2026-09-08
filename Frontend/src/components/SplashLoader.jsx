import React from 'react';

export default function SplashLoader({ message = 'Loading Mausam Personalization...' }) {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-brand">
          <div className="splash-logo-circle">
            <span className="splash-cloud">☁️</span>
            <span className="splash-sun">☀️</span>
          </div>
          <h2 className="splash-title">Mausam</h2>
          <span className="splash-badge">SIH Personalization Engine</span>
        </div>
        <div className="splash-spinner-wrapper">
          <div className="splash-spinner"></div>
        </div>
        <p className="splash-message">{message}</p>
      </div>
    </div>
  );
}
