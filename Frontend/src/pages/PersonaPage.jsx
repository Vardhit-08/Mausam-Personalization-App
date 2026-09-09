/**
 * PersonaPage.jsx
 * 
 * Part 3: Persona Selection Flow & Grid
 * 
 * Features:
 * - 4 Primary demo personas (Fitness, Traveler, Health, Commuter) + Agriculture prominently featured.
 * - Architecture compatibility with full 8-persona vision from Mausam-personalization docx.
 * - Clear selected state with checkmark indicators and institutional accent borders.
 * - Tailored meteorological preview tags for each persona.
 * - Upcoming domain profiles (Parents & Families, Event Planners, Coastal & Marine) displayed with v2.0 badge.
 * - Canonical persistence via useAuth().selectPersona().
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Activity,
  Plane,
  HeartPulse,
  Car,
  Wheat,
  Users,
  Compass,
  Anchor,
  ArrowRight,
  Sun,
  Droplets,
  ShieldAlert,
  Wind,
  Clock,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';

export const PRIMARY_PERSONAS = [
  {
    id: 'fitness',
    name: 'Outdoor Fitness',
    hindiName: 'आउटडोर फिटनेस',
    badge: 'Athletics & Training',
    tagClass: 'tag-fitness',
    cardClass: 'card-fitness-mode',
    icon: Activity,
    color: '#0284c7',
    summary: 'Optimized for runners, cyclists, and athletes tracking ambient sweat rates, thermal comfort windows, UV burn risk, and wind resistance.',
    previews: [
      { icon: Clock, label: 'Optimal Workout Window (6:00 – 8:00 AM)' },
      { icon: Droplets, label: 'Sweat Risk & Hydration Target (ml/hr)' },
      { icon: Sun, label: 'UV Index & Peak Burn Thresholds' },
    ],
  },
  {
    id: 'traveler',
    name: 'Traveler & Explorer',
    hindiName: 'यात्री एवं पर्यटक',
    badge: 'Intercity Transit',
    tagClass: 'tag-traveler',
    cardClass: 'card-traveler-mode',
    icon: Plane,
    color: '#8b5cf6',
    summary: 'Designed for domestic and international transit passengers tracking destination precipitation, airport wind conditions, and packing advisories.',
    previews: [
      { icon: MapPin, label: 'Destination Rain Likelihood & Radar' },
      { icon: Wind, label: 'Airport & Highway Wind Stability' },
      { icon: Sparkles, label: 'Weather-Informed Packing Assistant' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Respiratory',
    hindiName: 'स्वास्थ्य एवं श्वसन',
    badge: 'Advisories & AQI',
    tagClass: 'tag-health',
    cardClass: 'card-health-mode',
    icon: HeartPulse,
    color: '#f43f5e',
    summary: 'Essential for sensitive individuals, seniors, and asthmatic patients managing PM2.5 air pollution, allergen blooms, and thermal heat stress.',
    previews: [
      { icon: ShieldAlert, label: 'Real-time AQI & PM2.5 Particulate Hazard' },
      { icon: Sun, label: 'Heat Index & Wet-Bulb Heat Strain' },
      { icon: Droplets, label: 'Pollen Allergen Concentration' },
    ],
  },
  {
    id: 'commuter',
    name: 'Urban Commuter',
    hindiName: 'दैनिक यात्री',
    badge: 'Road & Metro Safety',
    tagClass: 'tag-commuter',
    cardClass: 'card-commuter-mode',
    icon: Car,
    color: '#f59e0b',
    summary: 'Tailored for daily office goers navigating urban road conditions, fog visibility, corridor congestion, and localized monsoon waterlogging.',
    previews: [
      { icon: Compass, label: 'Corridor Fog & Sightline Visibility' },
      { icon: Droplets, label: 'Waterlogging & Slick Road Risk' },
      { icon: Clock, label: 'Best Transit Departure Window' },
    ],
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Farming',
    hindiName: 'कृषि एवं कृषक',
    badge: 'Agrometeorology',
    tagClass: 'tag-agri',
    cardClass: 'card-agri-mode',
    icon: Wheat,
    color: '#10b981',
    summary: 'Engineered for farmers, agronomists, and crop managers tracking soil moisture, agrochemical spraying windows, and frost/heat crop stress.',
    previews: [
      { icon: Droplets, label: 'Soil Moisture at 15–30 cm Root Zone' },
      { icon: Wind, label: 'Chemical Spraying Suitability Window' },
      { icon: Sparkles, label: 'Monsoon Precipitation 5-Day Outlook' },
    ],
  },
];

export const UPCOMING_PERSONAS = [
  {
    id: 'family',
    name: 'Parents & Families',
    hindiName: 'अभिभावक एवं परिवार',
    icon: Users,
    desc: 'School transit safety, playground comfort, pediatric UV protection, and family weekend planning.',
  },
  {
    id: 'events',
    name: 'Event & Outdoor Planners',
    hindiName: 'इवेंट आयोजक',
    icon: Sparkles,
    desc: '48-hour localized thunderstorm alerts, stage wind gust safety limits, and crowd heat strain monitoring.',
  },
  {
    id: 'coastal',
    name: 'Coastal & Fisher Communities',
    hindiName: 'तटीय एवं मत्स्य पालन',
    icon: Anchor,
    desc: 'IMD marine bulletins, sea swell & wave height, high tide calendars, and offshore squall warnings.',
  },
];

export default function PersonaPage() {
  const [selected, setSelected] = useState('health');
  const { selectPersona, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = () => {
    const targetRoute = selectPersona(selected);
    navigate(targetRoute, { replace: true });
  };

  return (
    <div className="page-wrapper persona-page">
      <Navbar />

      <main className="persona-main">
        <div className="persona-container">
          {/* Header */}
          <div className="persona-header">
            <div className="persona-step-indicator">
              <span className="step-pill active">Step 2 of 2</span>
              <span className="step-desc">Institutional Weather Profile</span>
            </div>
            <h1 className="persona-title">Choose Your Primary Weather Persona</h1>
            <p className="persona-subtitle">
              Welcome, <strong>{currentUser?.name || currentUser?.email?.split('@')[0] || 'Meteorology Explorer'}</strong>. 
              Mausam reorganizes raw IMD radar, air quality, and forecast data into plain-language guidance tailored to your daily activities.
            </p>
          </div>

          {/* Primary Personas Grid */}
          <div className="persona-section-title-row">
            <h2 className="persona-section-heading">Primary Operational Profiles</h2>
            <span className="persona-section-caption">Select one profile to prioritize on your dashboard</span>
          </div>

          <div className="persona-cards-grid">
            {PRIMARY_PERSONAS.map((p) => {
              const isSelected = selected === p.id;
              const IconComp = p.icon;
              return (
                <div
                  key={p.id}
                  className={`persona-card ${p.cardClass} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelected(p.id)}
                  id={`persona-card-${p.id}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(p.id);
                    }
                  }}
                >
                  <div className="card-selection-indicator">
                    <div className={`indicator-radio ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check size={16} strokeWidth={3} />}
                    </div>
                  </div>

                  <div className={`persona-card-icon-box icon-${p.id}`}>
                    <IconComp size={32} />
                  </div>

                  <div className="persona-card-content">
                    <div className="persona-title-row">
                      <div>
                        <h3 className="persona-name">{p.name}</h3>
                        <span className="persona-hindi-name">{p.hindiName}</span>
                      </div>
                      <span className={`persona-badge-tag ${p.tagClass}`}>{p.badge}</span>
                    </div>

                    <p className="persona-summary">{p.summary}</p>

                    <div className="persona-preview-tags">
                      {p.previews.map((prev, idx) => {
                        const PrevIcon = prev.icon;
                        return (
                          <span key={idx} className="preview-tag">
                            <PrevIcon size={13} className="preview-tag-icon" />
                            <span>{prev.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Architecture Compatibility Section (Upcoming Personas) */}
          <div className="upcoming-personas-section">
            <div className="upcoming-header">
              <div>
                <h3 className="upcoming-title">Expanded 8-Persona Architecture</h3>
                <p className="upcoming-subtitle">
                  Future-ready modules defined in the Mausam Personalization blueprint.
                </p>
              </div>
              <span className="badge-v2">IMD Rollout v2.0</span>
            </div>

            <div className="upcoming-cards-row">
              {UPCOMING_PERSONAS.map((up) => {
                const UpIcon = up.icon;
                return (
                  <div key={up.id} className="upcoming-persona-card" id={`persona-upcoming-${up.id}`}>
                    <div className="upcoming-icon-box">
                      <UpIcon size={22} />
                    </div>
                    <div className="upcoming-content">
                      <div className="upcoming-name-row">
                        <span className="upcoming-name">{up.name}</span>
                        <span className="upcoming-pill">Upcoming</span>
                      </div>
                      <span className="upcoming-hindi">{up.hindiName}</span>
                      <p className="upcoming-desc">{up.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="persona-action-footer">
            <button
              type="button"
              className="btn btn-primary btn-lg persona-confirm-btn"
              onClick={handleConfirm}
              id="persona-continue-btn"
            >
              <span>Continue to Personalized Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <p className="persona-footnote">
              <Sparkles size={14} className="inline-sparkle" />
              You can seamlessly switch personas anytime from the top navigation bar or settings menu.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
