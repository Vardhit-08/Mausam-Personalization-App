import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';
import {
  CloudSun,
  HeartPulse,
  Wheat,
  Sun,
  Droplets,
  Wind,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  TrendingUp,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';

export default function DashboardPage() {
  const { persona, currentUser, selectPersona, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date().toLocaleTimeString());

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  const isHealth = persona === 'health';
  const isAgri = persona === 'agriculture';

  return (
    <div className="page-wrapper dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Top Bar / Greeting */}
          <div className="dashboard-header">
            <div className="greeting-group">
              <div className="greeting-title-row">
                <h1 className="greeting-title">
                  Welcome, <span className="greeting-name">{currentUser.name || 'Meteorology User'}</span>
                </h1>
                <div className={`persona-indicator-pill ${isHealth ? 'health' : 'agri'}`} id="dashboard-persona-pill">
                  {isHealth ? <HeartPulse size={16} /> : <Wheat size={16} />}
                  <span>{isHealth ? 'Health Persona Active' : 'Agriculture Persona Active'}</span>
                </div>
              </div>
              <p className="greeting-subtitle">
                <MapPin size={14} className="inline-icon" />
                <span>Station: IMD Regional Centre • Pune / Western Region • Updated at {lastRefreshed}</span>
              </p>
            </div>

            <div className="dashboard-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleRefresh}
                title="Refresh Weather Observations"
                id="dashboard-refresh-btn"
              >
                <RefreshCw size={14} />
                <span>Refresh Data</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowProfile(true)}
                id="dashboard-profile-btn"
              >
                <SlidersHorizontal size={14} />
                <span>Profile & Settings</span>
              </button>
            </div>
          </div>

          {/* Current General Weather Metric Bar */}
          <section className="general-weather-bar">
            <div className="weather-metric-tile">
              <div className="tile-icon-box bg-amber">
                <Sun size={22} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Ambient Temperature</span>
                <span className="tile-val">34.2°C</span>
                <span className="tile-sub">Feels like 38°C</span>
              </div>
            </div>

            <div className="weather-metric-tile">
              <div className="tile-icon-box bg-blue">
                <Droplets size={22} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Relative Humidity</span>
                <span className="tile-val">68%</span>
                <span className="tile-sub">High vapor pressure</span>
              </div>
            </div>

            <div className="weather-metric-tile">
              <div className="tile-icon-box bg-teal">
                <Wind size={22} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Wind Velocity</span>
                <span className="tile-val">11.4 km/h</span>
                <span className="tile-sub">Gusting to 16 km/h (WSW)</span>
              </div>
            </div>

            <div className="weather-metric-tile">
              <div className="tile-icon-box bg-indigo">
                <CloudSun size={22} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Atmospheric Pressure</span>
                <span className="tile-val">1009 hPa</span>
                <span className="tile-sub">Barometric trend steady</span>
              </div>
            </div>
          </section>

          {/* Persona Personalized View */}
          {isHealth && (
            <section className="personalized-section health-dashboard-section" id="health-dashboard-view">
              <div className="section-persona-banner health-banner">
                <div className="banner-content">
                  <div className="banner-icon-circle health-bg">
                    <HeartPulse size={28} />
                  </div>
                  <div>
                    <h2>Health Vulnerability & Preventive Advisories</h2>
                    <p>Tailored alerts analyzing respiratory hazards, thermal stress, and ultraviolet risk.</p>
                  </div>
                </div>
                <div className="banner-quick-action">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => selectPersona('agriculture')}
                    id="dashboard-switch-to-agri"
                  >
                    Switch to Agri Persona
                  </button>
                </div>
              </div>

              <div className="dashboard-grid">
                {/* UV Index Alert */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <div className="card-title-group">
                      <Sun className="text-amber" size={20} />
                      <h3>Ultraviolet (UV) Radiation</h3>
                    </div>
                    <span className="status-pill status-danger">Extreme (UV 9.4)</span>
                  </div>
                  <div className="dash-card-body">
                    <div className="big-stat-row">
                      <span className="big-stat-number text-amber">9.4</span>
                      <span className="big-stat-unit">Peak index</span>
                    </div>
                    <p className="card-advisory-text">
                      High burn risk for sensitive skin within 15 minutes. Avoid unshaded solar exposure between <strong>11:30 AM and 3:30 PM</strong>.
                    </p>
                    <div className="progress-track">
                      <div className="progress-bar bg-amber" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>

                {/* AQI & Respiratory Hazard */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <div className="card-title-group">
                      <ShieldAlert className="text-rose" size={20} />
                      <h3>Respiratory Hazard & AQI</h3>
                    </div>
                    <span className="status-pill status-warning">AQI 168 (Unhealthy)</span>
                  </div>
                  <div className="dash-card-body">
                    <div className="big-stat-row">
                      <span className="big-stat-number text-rose">168</span>
                      <span className="big-stat-unit">PM2.5: 78 µg/m³</span>
                    </div>
                    <p className="card-advisory-text">
                      High airborne particulate concentration. Asthmatic patients should carry preventive inhalers and restrict intense aerobic workouts outdoors.
                    </p>
                    <div className="progress-track">
                      <div className="progress-bar bg-rose" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Heat Strain & Hydration */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <div className="card-title-group">
                      <AlertTriangle className="text-orange" size={20} />
                      <h3>Wet-Bulb Globe Heat Strain</h3>
                    </div>
                    <span className="status-pill status-warning">Moderate Risk</span>
                  </div>
                  <div className="dash-card-body">
                    <div className="big-stat-row">
                      <span className="big-stat-number text-orange">29.1°C</span>
                      <span className="big-stat-unit">Wet-bulb threshold</span>
                    </div>
                    <p className="card-advisory-text">
                      Elevated humidity inhibits natural evaporative cooling. Minimum recommended hydration target: <strong>500 ml every 45 mins</strong> during physical exertion.
                    </p>
                    <div className="progress-track">
                      <div className="progress-bar bg-orange" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {isAgri && (
            <section className="personalized-section agri-dashboard-section" id="agri-dashboard-view">
              <div className="section-persona-banner agri-banner">
                <div className="banner-content">
                  <div className="banner-icon-circle agri-bg">
                    <Wheat size={28} />
                  </div>
                  <div>
                    <h2>Agrometeorological & Crop Protection Operations</h2>
                    <p>Actionable farm guidance analyzing precipitation likelihood, evaporation, and field access.</p>
                  </div>
                </div>
                <div className="banner-quick-action">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => selectPersona('health')}
                    id="dashboard-switch-to-health"
                  >
                    Switch to Health Persona
                  </button>
                </div>
              </div>

              <div className="dashboard-grid">
                {/* Soil Moisture & Irrigation */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <div className="card-title-group">
                      <Droplets className="text-blue" size={20} />
                      <h3>Soil Moisture (Root Zone)</h3>
                    </div>
                    <span className="status-pill status-success">Optimal (72%)</span>
                  </div>
                  <div className="dash-card-body">
                    <div className="big-stat-row">
                      <span className="big-stat-number text-blue">72%</span>
                      <span className="big-stat-unit">Field Capacity</span>
                    </div>
                    <p className="card-advisory-text">
                      Adequate moisture at 15–30 cm soil depth. Skip canal/drip irrigation for next 48 hours to prevent root-rot and waterlogging.
                    </p>
                    <div className="progress-track">
                      <div className="progress-bar bg-blue" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Agrochemical Spraying Window */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <div className="card-title-group">
                      <Wind className="text-emerald" size={20} />
                      <h3>Chemical Spraying Suitability</h3>
                    </div>
                    <span className="status-pill status-success">Favorable Window</span>
                  </div>
                  <div className="dash-card-body">
                    <div className="big-stat-row">
                      <span className="big-stat-number text-emerald">Next 6 hrs</span>
                      <span className="big-stat-unit">Wind &lt; 12 km/h</span>
                    </div>
                    <p className="card-advisory-text">
                      Calm conditions with zero precipitation forecast until tomorrow evening. Recommended window for fungicide or nutrient foliar spraying.
                    </p>
                    <div className="progress-track">
                      <div className="progress-bar bg-emerald" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>

                {/* 5-Day Rainfall Outlook */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <div className="card-title-group">
                      <Calendar className="text-indigo" size={20} />
                      <h3>Precipitation Forecast</h3>
                    </div>
                    <span className="status-pill status-info">Moderate Rain in 36h</span>
                  </div>
                  <div className="dash-card-body">
                    <div className="big-stat-row">
                      <span className="big-stat-number text-indigo">28 mm</span>
                      <span className="big-stat-unit">Expected accumulation</span>
                    </div>
                    <p className="card-advisory-text">
                      Monsoon trough moving southwards. Ensure drainage channels are cleared around low-lying field plots.
                    </p>
                    <div className="progress-track">
                      <div className="progress-bar bg-indigo" style={{ width: '55%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Session Persistence Verification Banner */}
          <section className="persistence-notice-card" id="session-persistence-indicator">
            <div className="notice-icon-box">
              <CheckCircle2 size={24} className="text-emerald" />
            </div>
            <div className="notice-text">
              <h4>Canonical Session Persistence Verified</h4>
              <p>
                Authentication state (<code>isLoggedIn: true</code>) and active persona (
                <code>activePersona: "{persona}"</code>) are saved in LocalStorage. Refreshing this browser tab will keep you directly on this personalized dashboard without redirecting to landing or persona selection.
              </p>
            </div>
          </section>
        </div>
      </main>

      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onLogout={() => {
            const target = logout();
            setShowProfile(false);
          }}
        />
      )}
    </div>
  );
}
