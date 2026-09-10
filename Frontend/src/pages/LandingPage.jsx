import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import { HeartPulse, Wheat, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="page-wrapper landing-page">
      <Navbar />

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} className="badge-icon" />
              <span>SIH 26076: Mausam Personalization</span>
            </div>
            <h1 className="hero-title">
              Personalized Weather Advisories for <span className="gradient-text">Health & Agriculture</span>
            </h1>
            <p className="hero-description">
              Raw forecasts aren't enough. Mausam transforms real-time meteorological indicators into actionable advisories tailored specifically to your daily health vulnerabilities and farming lifecycle.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg" id="hero-create-account-btn">
                <span>Create Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login-btn">
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-card card-health">
              <div className="card-header-icon health-icon">
                <HeartPulse size={24} />
              </div>
              <div className="card-body">
                <span className="card-tag">Health Persona</span>
                <h4>Asthma & Heat Index</h4>
                <p>Air Quality (AQI 168) advisory: Keep outdoor activity limited between 1 PM and 4 PM.</p>
                <div className="card-metric">
                  <span className="metric-val">High Alert</span>
                  <span className="metric-label">UV Index 9.2</span>
                </div>
              </div>
            </div>

            <div className="floating-card card-agri">
              <div className="card-header-icon agri-icon">
                <Wheat size={24} />
              </div>
              <div className="card-body">
                <span className="card-tag">Agriculture Persona</span>
                <h4>Spraying & Irrigation</h4>
                <p>Heavy rainfall expected in 36 hrs. Postpone fertilizer application to prevent runoff.</p>
                <div className="card-metric">
                  <span className="metric-val">74% Moisture</span>
                  <span className="metric-label">Soil Top Layer</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="section-header">
            <span className="section-kicker">Tailored Intelligence</span>
            <h2 className="section-title">Two Distinct Operational Models</h2>
            <p className="section-desc">Experience customized alerts built upon IMD meteorological data.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon bg-rose">
                <HeartPulse size={28} />
              </div>
              <h3>Health Persona</h3>
              <p>Personalized heat-wave mitigation, particulate matter alerts (PM2.5 / PM10), humidity-induced respiratory vulnerability, and hydration alerts.</p>
              <ul className="feature-list">
                <li>Real-time UV Index protection guidance</li>
                <li>Pollen count & respiratory risk index</li>
                <li>Heatstroke risk thresholds</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-emerald">
                <Wheat size={28} />
              </div>
              <h3>Agriculture Persona</h3>
              <p>Granular agrometeorological advisories, precipitation forecasts, optimal spraying windows, soil moisture tracking, and crop protection advisories.</p>
              <ul className="feature-list">
                <li>Window of pesticide & fertilizer application</li>
                <li>Sowing and harvesting suitability</li>
                <li>Frost and excessive moisture warnings</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-sky">
                <ShieldCheck size={28} />
              </div>
              <h3>Persistent Demo Architecture</h3>
              <p>Robust client-side session management guaranteeing state consistency across page refresh, browser restart, and direct navigation.</p>
              <ul className="feature-list">
                <li>Strict 3-state authentication model</li>
                <li>Preserves selected persona across sessions</li>
                <li>Full route protection & logout guards</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
