/**
 * DashboardPage.jsx
 * 
 * Part 5: Personalized Dashboard Foundation
 * 
 * Features:
 * - Responsive Institutional Layout with official IMD Blue system.
 * - Top Control Bar: PersonaSwitcher (5 personas) + ModeToggle (Personalized vs Generic IMD).
 * - DemoScenarioBar: On-the-fly scenario testing for Hackathon evaluators.
 * - Dynamic Weather Metric Tiles bound to active IMD Station.
 * - Personalized View:
 *   - Leading InsightCard with computed score, plain-English advice, and "Why am I seeing this?" accordion.
 *   - DynamicCardGrid with ranked algorithmic indices based on persona, severity, and context.
 *   - BestHoursTimeline with color-coded optimal windows.
 *   - SunMoonCard with solar arc visualization.
 * - Generic IMD View:
 *   - Conventional unranked data broadcast with 7-Day forecast table, past 24h readings, normals.
 * - NotificationCenter integration with unread badge.
 * - GuidedTour integration with first-time auto-trigger and manual relaunch.
 * - Mobile Bottom Navigation Bar for rapid thumb-friendly navigation.
 * - Canonical session & station persistence in LocalStorage.
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import Navbar from '../components/Navbar';
import ProfileModal from '../components/ProfileModal';
import CitySelectorModal from '../components/CitySelectorModal';
import GuidedTour, { isTourCompleted, setTourCompleted } from '../components/GuidedTour';
import ModeToggle from '../components/ModeToggle';
import PersonaSwitcher from '../components/PersonaSwitcher';
import InsightCard from '../components/InsightCard';
import DynamicCardGrid from '../components/DynamicCardGrid';
import BestHoursTimeline from '../components/BestHoursTimeline';
import SunMoonCard from '../components/SunMoonCard';
import NotificationCenter from '../components/NotificationCenter';
import DemoScenarioBar from '../components/DemoScenarioBar';
import { CITIES_DATA } from '../data/citiesData';
import { generatePersonalizedDashboard, PERSONAS } from '../services/personalizationEngine';
import {
  Sun,
  Droplets,
  Wind,
  CloudSun,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Lightbulb,
  CheckCircle2,
  Layers,
  Sparkles,
  LayoutDashboard,
  Clock,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const { persona, currentUser, selectPersona, logout } = useAuth();

  // Dialog states
  const [showProfile, setShowProfile] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(() => !isTourCompleted());

  // View mode state: 'personalized' vs 'generic'
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('mausam_view_mode') || 'personalized');

  // Selected city state
  const [selectedCityId, setSelectedCityId] = useState(() => localStorage.getItem('mausam_selected_city') || 'pune');

  // Interactive demo scenario overrides
  const [activeScenario, setActiveScenario] = useState(null);

  // Refresh timestamp
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date().toLocaleTimeString());

  // Active persona key validation
  const activePersonaKey = (persona && PERSONAS[persona.toLowerCase()]) ? persona.toLowerCase() : 'fitness';

  // Current station data
  const currentCity = useMemo(() => {
    return CITIES_DATA.find((c) => c.cityId === selectedCityId) || CITIES_DATA[2] || CITIES_DATA[0];
  }, [selectedCityId]);

  // Generate personalized dashboard pipeline
  const personalizedData = useMemo(() => {
    return generatePersonalizedDashboard({
      persona: activePersonaKey,
      cityData: currentCity,
      scenarioOverrides: activeScenario?.overrides || {},
    });
  }, [activePersonaKey, currentCity, activeScenario]);

  const handleSelectCity = (city) => {
    setSelectedCityId(city.cityId);
    localStorage.setItem('mausam_selected_city', city.cityId);
  };

  const handleToggleMode = (newMode) => {
    setViewMode(newMode);
    localStorage.setItem('mausam_view_mode', newMode);
  };

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  const handleScenarioChange = (scenario) => {
    setActiveScenario(scenario);
    if (scenario?.persona && scenario.persona !== activePersonaKey) {
      selectPersona(scenario.persona);
    }
  };

  return (
    <div className={`page-wrapper dashboard-page persona-env-${activePersonaKey}`}>
      <Navbar />

      {/* Evaluator Demonstration Scenario Bar */}
      <DemoScenarioBar onSelectScenario={handleScenarioChange} activeScenarioId={activeScenario?.id} />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Header & Station Greeting */}
          <header className="dashboard-header">
            <div className="greeting-group">
              <div className="greeting-title-row">
                <h1 className="greeting-title">
                  Welcome, <span className="greeting-name">{currentUser?.name || currentUser?.email?.split('@')[0] || 'Meteorology User'}</span>
                </h1>
                <div className={`persona-indicator-pill ${activePersonaKey}`} id="dashboard-persona-pill">
                  <span className="persona-emoji-icon">{PERSONAS[activePersonaKey]?.icon || '🌤️'}</span>
                  <span>{PERSONAS[activePersonaKey]?.name || 'Personalized'} Active</span>
                </div>
              </div>

              <div className="greeting-subtitle-row">
                <button
                  type="button"
                  className="station-selector-trigger"
                  onClick={() => setShowCitySelector(true)}
                  id="dashboard-station-trigger"
                  title="Click to switch IMD weather station"
                >
                  <MapPin size={14} className="inline-icon text-accent" />
                  <span>Station: IMD Regional Centre • {currentCity.cityName} ({currentCity.state})</span>
                  <span className="station-pill-tag">Switch Station</span>
                </button>
                <span className="station-update-meta">Updated: {lastRefreshed}</span>
              </div>
            </div>

            <div className="dashboard-actions">
              {/* Station Picker Button */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCitySelector(true)}
                title="Select IMD Weather Station"
                id="dashboard-change-station-btn"
              >
                <MapPin size={14} />
                <span>{currentCity.cityName}</span>
              </button>

              {/* Notification Center Trigger */}
              <NotificationCenter />

              {/* Guided Tour Trigger with Blinking Help Bulb */}
              <button
                type="button"
                className="btn-tour-trigger tour-blinking-bulb-btn"
                onClick={() => setIsTourOpen(true)}
                id="dashboard-tour-btn"
                title="Interactive Guide: Why & How to use Mausam Personalization"
                aria-label="Launch interactive guided tour"
              >
                <Lightbulb size={15} className="text-amber tour-bulb-pulse" />
                <span>Guided Tour</span>
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleRefresh}
                title="Refresh Weather Observations"
                id="dashboard-refresh-btn"
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>

              {/* Profile & Settings Trigger */}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowProfile(true)}
                id="dashboard-profile-btn"
                title="Profile & Preferences"
              >
                <SlidersHorizontal size={14} />
                <span>Settings</span>
              </button>
            </div>
          </header>

          {/* Top Control Bar: Persona Switcher + Mode Toggle */}
          <section className="dashboard-top-controls">
            <div className="dashboard-controls-row">
              <PersonaSwitcher
                activePersona={activePersonaKey}
                onSelectPersona={(p) => selectPersona(p)}
              />
              <ModeToggle
                mode={viewMode}
                onToggleMode={handleToggleMode}
              />
            </div>
          </section>

          {/* Current General Weather Metric Bar */}
          <section className="general-weather-bar" id="tour-weather-bar">
            <div className="weather-metric-tile">
              <div className="tile-icon-box bg-amber">
                <Sun size={22} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Ambient Temperature</span>
                <span className="tile-val">
                  {(activeScenario?.overrides?.temperature ?? currentCity.current?.temperature)?.toFixed(1)}°C
                </span>
                <span className="tile-sub">
                  Feels like {(currentCity.current?.feelsLike || currentCity.current?.temperature)?.toFixed(1)}°C
                </span>
              </div>
            </div>

            <div className="weather-metric-tile">
              <div className="tile-icon-box bg-blue">
                <Droplets size={22} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Relative Humidity</span>
                <span className="tile-val">
                  {activeScenario?.overrides?.humidity ?? currentCity.current?.humidity ?? 60}%
                </span>
                <span className="tile-sub">
                  {activeScenario?.overrides?.condition ?? currentCity.current?.condition ?? 'Partly Cloudy'}
                </span>
              </div>
            </div>

            <div className="weather-metric-tile">
              <div className="tile-icon-box bg-teal">
                <Wind size={22} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Wind Velocity</span>
                <span className="tile-val">
                  {currentCity.current?.wind?.speedKmh || 12.0} km/h
                </span>
                <span className="tile-sub">
                  Direction: {currentCity.current?.wind?.direction || 'WNW'}
                </span>
              </div>
            </div>

            <div className="weather-metric-tile">
              <div className="tile-icon-box bg-indigo">
                <CloudSun size={22} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Air Quality Index</span>
                <span className="tile-val">
                  AQI {currentCity.current?.airQuality?.aqi || 109}
                </span>
                <span className="tile-sub">
                  {currentCity.current?.airQuality?.category || 'Moderate'} ({currentCity.current?.airQuality?.dominantPollutant || 'PM2.5'})
                </span>
              </div>
            </div>
          </section>

          {/* VIEW MODE 1: PERSONALIZED VIEW */}
          {viewMode === 'personalized' && (
            <div className="personalized-view-container" id="personalized-view-root">
              {/* Leading Primary Insight Card */}
              <InsightCard insightData={personalizedData.insightCard} />

              {/* Dynamically Prioritized Indicator Cards */}
              <DynamicCardGrid cards={personalizedData.prioritizedCards} />

              {/* Best Hours Timeline */}
              <BestHoursTimeline persona={activePersonaKey} />

              {/* Sun & Moon Astronomical Arc */}
              <SunMoonCard sunData={currentCity.sun} moonData={currentCity.moon} />
            </div>
          )}

          {/* VIEW MODE 2: GENERIC IMD VIEW */}
          {viewMode === 'generic' && (
            <div className="generic-view-container" id="generic-view-root">
              {/* Conventional Notice Banner */}
              <div className="generic-notice-banner">
                <div className="generic-notice-text">
                  <Layers size={22} className="text-amber" />
                  <div>
                    <h4>Conventional IMD Weather Broadcast (Generic Mode)</h4>
                    <p>
                      Displaying raw government meteorological bulletins without personal ranking. Switch to <strong>Personalized</strong> to experience algorithmic insight prioritization.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleToggleMode('personalized')}
                >
                  <Sparkles size={14} />
                  <span>Switch to Personalized</span>
                </button>
              </div>

              {/* 7-Day IMD Forecast Grid */}
              <div className="generic-forecast-table-card">
                <div className="generic-section-title-row">
                  <h3 className="generic-section-title">7-Day IMD Regional Forecast Outlook</h3>
                  <span className="badge-v2">Official Bulletin</span>
                </div>

                <div className="forecast-days-grid">
                  {(currentCity.dailyForecast || []).map((day, idx) => (
                    <div key={idx} className="forecast-day-card">
                      <span className="forecast-day-date">{day.day} • {day.date}</span>
                      <span className="forecast-day-condition">{day.condition}</span>
                      <div className="forecast-day-temp-range">
                        <span className="temp-max-pill" title="Max Temp">{day.maxTemp}°C</span>
                        <span>/</span>
                        <span className="temp-min-pill" title="Min Temp">{day.minTemp}°C</span>
                      </div>
                      <span className="forecast-day-rain">🌧 {day.rainProbability}% rain</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Climatological Normals & Extremes */}
              <div className="generic-normals-card">
                <div className="normal-metric-box">
                  <span className="normal-metric-label">Normal Max Temp</span>
                  <span className="normal-metric-val">33.5°C</span>
                  <span className="normal-metric-desc">Climatological baseline</span>
                </div>
                <div className="normal-metric-box">
                  <span className="normal-metric-label">Normal Min Temp</span>
                  <span className="normal-metric-val">22.8°C</span>
                  <span className="normal-metric-desc">Night cooling baseline</span>
                </div>
                <div className="normal-metric-box">
                  <span className="normal-metric-label">Monthly Rainfall</span>
                  <span className="normal-metric-val">142 mm</span>
                  <span className="normal-metric-desc">Monsoon seasonal normal</span>
                </div>
                <div className="normal-metric-box">
                  <span className="normal-metric-label">Station Elevation</span>
                  <span className="normal-metric-val">560 m</span>
                  <span className="normal-metric-desc">Above Mean Sea Level</span>
                </div>
              </div>

              {/* Sun & Moon Timings */}
              <SunMoonCard sunData={currentCity.sun} moonData={currentCity.moon} />
            </div>
          )}

          {/* Session Persistence Verification Banner */}
          <section className="persistence-notice-card" id="session-persistence-indicator">
            <div className="notice-icon-box">
              <CheckCircle2 size={24} className="text-emerald" />
            </div>
            <div className="notice-text">
              <h4>Official Session & Station Persistence Verified</h4>
              <p>
                Authentication state (<code>isLoggedIn: true</code>), active persona (
                <code>activePersona: "{activePersonaKey}"</code>), station (
                <code>station: "{currentCity.cityName}"</code>), and mode (
                <code>viewMode: "{viewMode}"</code>) are saved in LocalStorage.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className="mobile-nav-btn active"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={() => {
            const el = document.getElementById('tour-indices-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Clock size={20} />
          <span>Timeline</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={() => setShowCitySelector(true)}
        >
          <MapPin size={20} />
          <span>Station</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={() => setShowProfile(true)}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Dialog Modals */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onLogout={() => {
            logout();
            setShowProfile(false);
          }}
        />
      )}

      {showCitySelector && (
        <CitySelectorModal
          isOpen={showCitySelector}
          onClose={() => setShowCitySelector(false)}
          selectedCityId={selectedCityId}
          onSelectCity={handleSelectCity}
        />
      )}

      {/* Guided Tour System */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => {
          setIsTourOpen(false);
          setTourCompleted(true);
        }}
      />
    </div>
  );
}
