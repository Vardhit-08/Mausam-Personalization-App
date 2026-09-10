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
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import NotificationCenter from '../components/NotificationCenter';
import DemoScenarioBar from '../components/DemoScenarioBar';
import { CITIES_DATA } from '../data/citiesData';
import { generatePersonalizedDashboard, PERSONAS } from '../services/personalizationEngine';
import {
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Lightbulb,
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
                  Welcome, <span className="greeting-name">{currentUser?.displayName || currentUser?.name || currentUser?.email?.split('@')[0] || 'Meteorology User'}</span>
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

          {/* VIEW MODE 1: PERSONALIZED VIEW (Hierarchy: Advisory -> Best Hours -> Important Conditions -> Forecast -> Raw Data) */}
          {viewMode === 'personalized' && (
            <div className="personalized-view-container" id="personalized-view-root">
              {/* 1. PRIMARY ADVISORY: Official Editorial Public-Service Advisory */}
              <div className="dashboard-section-block primary-advisory-block">
                <InsightCard insightData={personalizedData.insightCard} />
              </div>

              {/* 2. ACTION / BEST HOURS: Operational Guidance Timeline */}
              <div className="dashboard-section-block best-hours-block" id="tour-indices-section">
                <div className="generic-section-title-row">
                  <h3 className="generic-section-title">Operational Time Windows</h3>
                  
                </div>
                <BestHoursTimeline persona={activePersonaKey} />
              </div>

              {/* 3. IMPORTANT CONDITIONS: Dynamically Prioritized Risk Indicators */}
              <div className="dashboard-section-block prioritized-conditions-block">
                <div className="generic-section-title-row">
                  <h3 className="generic-section-title">Contextual Environmental Indicators</h3>
                  
                </div>
                <DynamicCardGrid cards={personalizedData.prioritizedCards} />
              </div>

              {/* 4. FORECAST: 7-Day Regional Meteorological Outlook */}
              <div className="dashboard-section-block forecast-outlook-block">
                <div className="generic-forecast-table-card">
                  <div className="generic-section-title-row">
                    <h3 className="generic-section-title">7-Day Regional Forecast Outlook</h3>
                    
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
              </div>

              {/* 5. RAW METEOROLOGICAL DATA: Baseline Surface Station Observations */}
              <div className="dashboard-section-block raw-station-data-block">
                <div className="generic-section-title-row">
                  <h3 className="generic-section-title">Station Meteorological Observations</h3>
                  
                </div>

                <section className="observation-metric-strip" id="tour-weather-bar">
                  <div className="obs-metric-col">
                    <span className="obs-col-label">Temperature</span>
                    <div className="obs-col-primary">
                      <span className="obs-col-val">{(activeScenario?.overrides?.temperature ?? currentCity.current?.temperature)?.toFixed(1)}°C</span>
                      <span className="obs-col-badge">Feels {(currentCity.current?.feelsLike || currentCity.current?.temperature)?.toFixed(1)}°C</span>
                    </div>
                    <span className="obs-col-sub">{activeScenario?.overrides?.condition ?? currentCity.current?.condition ?? 'Partly Cloudy'}</span>
                  </div>

                  <div className="obs-divider" />

                  <div className="obs-metric-col">
                    <span className="obs-col-label">Humidity</span>
                    <div className="obs-col-primary">
                      <span className="obs-col-val">{activeScenario?.overrides?.humidity ?? currentCity.current?.humidity ?? 60}%</span>
                      <span className="obs-col-badge">Relative</span>
                    </div>
                    <span className="obs-col-sub">Dew Pt {((currentCity.current?.temperature || 28) - (100 - (activeScenario?.overrides?.humidity ?? currentCity.current?.humidity ?? 60)) / 5).toFixed(0)}°C</span>
                  </div>

                  <div className="obs-divider" />

                  <div className="obs-metric-col">
                    <span className="obs-col-label">Wind Velocity</span>
                    <div className="obs-col-primary">
                      <span className="obs-col-val">{currentCity.current?.wind?.speedKmh || 12.0} km/h</span>
                      <span className="obs-col-badge">{currentCity.current?.wind?.direction || 'WNW'}</span>
                    </div>
                    <span className="obs-col-sub">Surface Anemometer</span>
                  </div>

                  <div className="obs-divider" />

                  <div className="obs-metric-col">
                    <span className="obs-col-label">Air Quality</span>
                    <div className="obs-col-primary">
                      <span className="obs-col-val">AQI {currentCity.current?.airQuality?.aqi || 109}</span>
                      <span className="obs-col-badge aqi-status">{currentCity.current?.airQuality?.category || 'Moderate'}</span>
                    </div>
                    <span className="obs-col-sub">{currentCity.current?.airQuality?.dominantPollutant || 'PM2.5'} Dominant</span>
                  </div>
                </section>

                <details className="climatological-normals-details">
                  <summary className="climatological-normals-summary">
                    <span>Climatological Baseline & Station Normals</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to expand</span>
                  </summary>
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
                </details>

                <div style={{ marginTop: '1.25rem' }}>
                  <SunMoonCard sunData={currentCity.sun} moonData={currentCity.moon} />
                </div>
              </div>
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

              {/* Current Station Meteorological Observations */}
              <div className="dashboard-section-block">
                <div className="generic-section-title-row">
                  <h3 className="generic-section-title">Current Station Meteorological Observations</h3>
                  <span className="badge-v2">Official Surface Observations</span>
                </div>

                <section className="observation-metric-strip" id="tour-weather-bar-generic">
                  <div className="obs-metric-col">
                    <span className="obs-col-label">Temperature</span>
                    <div className="obs-col-primary">
                      <span className="obs-col-val">{(activeScenario?.overrides?.temperature ?? currentCity.current?.temperature)?.toFixed(1)}°C</span>
                      <span className="obs-col-badge">Feels {(currentCity.current?.feelsLike || currentCity.current?.temperature)?.toFixed(1)}°C</span>
                    </div>
                    <span className="obs-col-sub">{activeScenario?.overrides?.condition ?? currentCity.current?.condition ?? 'Partly Cloudy'}</span>
                  </div>

                  <div className="obs-divider" />

                  <div className="obs-metric-col">
                    <span className="obs-col-label">Humidity</span>
                    <div className="obs-col-primary">
                      <span className="obs-col-val">{activeScenario?.overrides?.humidity ?? currentCity.current?.humidity ?? 60}%</span>
                      <span className="obs-col-badge">Relative</span>
                    </div>
                    <span className="obs-col-sub">Dew Pt {((currentCity.current?.temperature || 28) - (100 - (activeScenario?.overrides?.humidity ?? currentCity.current?.humidity ?? 60)) / 5).toFixed(0)}°C</span>
                  </div>

                  <div className="obs-divider" />

                  <div className="obs-metric-col">
                    <span className="obs-col-label">Wind Velocity</span>
                    <div className="obs-col-primary">
                      <span className="obs-col-val">{currentCity.current?.wind?.speedKmh || 12.0} km/h</span>
                      <span className="obs-col-badge">{currentCity.current?.wind?.direction || 'WNW'}</span>
                    </div>
                    <span className="obs-col-sub">Surface Anemometer</span>
                  </div>

                  <div className="obs-divider" />

                  <div className="obs-metric-col">
                    <span className="obs-col-label">Air Quality</span>
                    <div className="obs-col-primary">
                      <span className="obs-col-val">AQI {currentCity.current?.airQuality?.aqi || 109}</span>
                      <span className="obs-col-badge aqi-status">{currentCity.current?.airQuality?.category || 'Moderate'}</span>
                    </div>
                    <span className="obs-col-sub">{currentCity.current?.airQuality?.dominantPollutant || 'PM2.5'} Dominant</span>
                  </div>
                </section>
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
        </div>
      </main>

      {/* Official IMD Public Service Footer */}
      <Footer onOpenTour={() => setIsTourOpen(true)} />

      {/* Subtle Back-to-Top Control */}
      <BackToTop />

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
          onLogout={async () => {
            await logout();
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
