/**
 * SunMoonCard.jsx
 * 
 * Sunrise, Sunset and Solar Arc Visualization component for SIH26076 Mausam.
 */

import React from 'react';
import { Sunrise, Sunset, Moon } from 'lucide-react';

export default function SunMoonCard({ sunData, moonData }) {
  const sunrise = sunData?.sunrise || '06:07';
  const sunset = sunData?.sunset || '18:32';
  const moonPhase = moonData?.phase || 'Waning Gibbous';

  return (
    <div className="sun-moon-card">
      <div className="sun-card-header">
        <h4 className="sun-card-title">Solar & Lunar Cycle</h4>
        <span className="sun-card-badge">Daylight ~12h 25m</span>
      </div>

      <div className="solar-arc-visual">
        <div className="solar-arc-curve">
          <div className="sun-position-dot" title="Current Solar Elevation"></div>
        </div>
        <div className="solar-horizon-line"></div>
      </div>

      <div className="sun-timings-grid">
        <div className="sun-timing-item">
          <div className="icon-circle bg-amber">
            <Sunrise size={18} />
          </div>
          <div>
            <span className="time-label">Sunrise</span>
            <strong className="time-val">{sunrise} IST</strong>
          </div>
        </div>

        <div className="sun-timing-item">
          <div className="icon-circle bg-orange">
            <Sunset size={18} />
          </div>
          <div>
            <span className="time-label">Sunset</span>
            <strong className="time-val">{sunset} IST</strong>
          </div>
        </div>

        <div className="sun-timing-item">
          <div className="icon-circle bg-indigo">
            <Moon size={18} />
          </div>
          <div>
            <span className="time-label">Moon Phase</span>
            <strong className="time-val">{moonPhase}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
