import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { HeartPulse, Wheat, CheckCircle2, ArrowRight, Sun, Droplets, ShieldAlert, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function PersonaPage() {
  const [selected, setSelected] = useState('health');
  const { selectPersona, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = () => {
    // Saves activePersona as "health" or "agriculture"
    // Returns target route '/dashboard'
    const targetRoute = selectPersona(selected);
    navigate(targetRoute, { replace: true });
  };

  return (
    <div className="page-wrapper persona-page">
      <Navbar />

      <main className="persona-main">
        <div className="persona-container">
          <div className="persona-header">
            <div className="persona-step-indicator">
              <span className="step-pill active">Step 2 of 2</span>
              <span className="step-desc">Persona Onboarding</span>
            </div>
            <h1 className="persona-title">Choose Your Primary Weather Persona</h1>
            <p className="persona-subtitle">
              Welcome, <strong>{currentUser.name || 'Meteorology Explorer'}</strong>. Mausam tailors IMD data indices, risk thresholds, and daily alerts based on your primary domain.
            </p>
          </div>

          <div className="persona-cards-grid">
            {/* Health Persona Card */}
            <div
              className={`persona-card card-health-mode ${selected === 'health' ? 'selected' : ''}`}
              onClick={() => setSelected('health')}
              id="persona-card-health"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected('health'); }}
            >
              <div className="card-selection-indicator">
                <div className={`indicator-radio ${selected === 'health' ? 'checked' : ''}`}>
                  {selected === 'health' && <CheckCircle2 size={18} />}
                </div>
              </div>

              <div className="persona-card-icon-box icon-health">
                <HeartPulse size={36} />
              </div>

              <div className="persona-card-content">
                <div className="persona-title-row">
                  <h3 className="persona-name">Health & Wellness</h3>
                  <span className="persona-badge-tag tag-health">Advisories</span>
                </div>
                <p className="persona-summary">
                  Designed for individuals, healthcare professionals, and vulnerable demographics managing respiratory sensitivity, cardiovascular strain, and extreme thermal conditions.
                </p>

                <div className="persona-preview-tags">
                  <span className="preview-tag">
                    <Sun size={13} /> UV Index & Heat Stress
                  </span>
                  <span className="preview-tag">
                    <ShieldAlert size={13} /> PM2.5 / AQI Air Hazard
                  </span>
                  <span className="preview-tag">
                    <Droplets size={13} /> Hydration & Dehydration Timing
                  </span>
                </div>
              </div>
            </div>

            {/* Agriculture Persona Card */}
            <div
              className={`persona-card card-agri-mode ${selected === 'agriculture' ? 'selected' : ''}`}
              onClick={() => setSelected('agriculture')}
              id="persona-card-agriculture"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected('agriculture'); }}
            >
              <div className="card-selection-indicator">
                <div className={`indicator-radio ${selected === 'agriculture' ? 'checked' : ''}`}>
                  {selected === 'agriculture' && <CheckCircle2 size={18} />}
                </div>
              </div>

              <div className="persona-card-icon-box icon-agri">
                <Wheat size={36} />
              </div>

              <div className="persona-card-content">
                <div className="persona-title-row">
                  <h3 className="persona-name">Agriculture & Farming</h3>
                  <span className="persona-badge-tag tag-agri">Agrometeorology</span>
                </div>
                <p className="persona-summary">
                  Engineered for farmers, agronomists, and supply chains optimizing planting cycles, irrigation schedules, agrochemical spraying windows, and frost/flood mitigation.
                </p>

                <div className="persona-preview-tags">
                  <span className="preview-tag">
                    <Droplets size={13} /> Soil Moisture & Evapotranspiration
                  </span>
                  <span className="preview-tag">
                    <Sun size={13} /> Spraying Suitability Windows
                  </span>
                  <span className="preview-tag">
                    <Sparkles size={13} /> Sowing & Harvest Windows
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="persona-action-footer">
            <button
              type="button"
              className="btn btn-primary btn-lg persona-confirm-btn"
              onClick={handleConfirm}
              id="persona-continue-btn"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <p className="persona-footnote">
              You can switch personas at any time inside your Profile & Settings.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
