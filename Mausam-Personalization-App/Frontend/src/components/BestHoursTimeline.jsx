/**
 * BestHoursTimeline.jsx
 * 
 * Hourly Condition Timeline component for SIH26076 Mausam.
 * Color-codes periods (Green = recommended, Amber = caution, Red = avoid).
 */

import React, { useState, useMemo } from 'react';
import { Clock, Info } from 'lucide-react';

const PERSONA_SLOTS = {
  fitness: [
    { time: '06:00', label: '6 AM', temp: '22°C', rain: '10%', status: 'recommended', statusText: 'Optimal Run' },
    { time: '08:00', label: '8 AM', temp: '25°C', rain: '15%', status: 'recommended', statusText: 'Good Cardio' },
    { time: '10:00', label: '10 AM', temp: '29°C', rain: '20%', status: 'caution', statusText: 'High UV Risk' },
    { time: '12:00', label: '12 PM', temp: '33°C', rain: '25%', status: 'avoid', statusText: 'Peak Heat Noon' },
    { time: '14:00', label: '2 PM', temp: '34°C', rain: '40%', status: 'avoid', statusText: 'Heat Exhaustion' },
    { time: '16:00', label: '4 PM', temp: '31°C', rain: '30%', status: 'caution', statusText: 'Warm / Humid' },
    { time: '18:00', label: '6 PM', temp: '27°C', rain: '15%', status: 'recommended', statusText: 'Pleasant Jog' },
    { time: '20:00', label: '8 PM', temp: '25°C', rain: '10%', status: 'recommended', statusText: 'Cool Evening' },
  ],
  traveler: [
    { time: '06:00', label: '6 AM', temp: '22°C', rain: '10%', status: 'recommended', statusText: 'Clear Runways' },
    { time: '08:00', label: '8 AM', temp: '25°C', rain: '15%', status: 'recommended', statusText: 'Smooth Transit' },
    { time: '10:00', label: '10 AM', temp: '29°C', rain: '25%', status: 'recommended', statusText: 'Clear Skies' },
    { time: '12:00', label: '12 PM', temp: '33°C', rain: '40%', status: 'caution', statusText: 'Corridor Delay' },
    { time: '14:00', label: '2 PM', temp: '34°C', rain: '55%', status: 'avoid', statusText: 'Turbulence / Rain' },
    { time: '16:00', label: '4 PM', temp: '31°C', rain: '45%', status: 'caution', statusText: 'Crosswind Gusts' },
    { time: '18:00', label: '6 PM', temp: '27°C', rain: '20%', status: 'recommended', statusText: 'Favorable Flow' },
    { time: '20:00', label: '8 PM', temp: '25°C', rain: '10%', status: 'recommended', statusText: 'Night Flights' },
  ],
  health: [
    { time: '06:00', label: '6 AM', temp: '22°C', rain: '10%', status: 'recommended', statusText: 'Lowest PM2.5' },
    { time: '08:00', label: '8 AM', temp: '25°C', rain: '15%', status: 'caution', statusText: 'Traffic Smog' },
    { time: '10:00', label: '10 AM', temp: '29°C', rain: '20%', status: 'caution', statusText: 'Rising Ozone' },
    { time: '12:00', label: '12 PM', temp: '33°C', rain: '25%', status: 'avoid', statusText: 'Peak UV & Heat' },
    { time: '14:00', label: '2 PM', temp: '34°C', rain: '30%', status: 'avoid', statusText: 'High Heat Strain' },
    { time: '16:00', label: '4 PM', temp: '31°C', rain: '35%', status: 'caution', statusText: 'Pollen Surge' },
    { time: '18:00', label: '6 PM', temp: '27°C', rain: '20%', status: 'recommended', statusText: 'Air Cleared' },
    { time: '20:00', label: '8 PM', temp: '25°C', rain: '10%', status: 'recommended', statusText: 'Stable Ambient' },
  ],
  commuter: [
    { time: '06:00', label: '6 AM', temp: '22°C', rain: '10%', status: 'recommended', statusText: 'Clear Corridor' },
    { time: '08:00', label: '8 AM', temp: '25°C', rain: '25%', status: 'caution', statusText: 'Morning Rush' },
    { time: '10:00', label: '10 AM', temp: '29°C', rain: '20%', status: 'recommended', statusText: 'Free Flowing' },
    { time: '12:00', label: '12 PM', temp: '33°C', rain: '25%', status: 'recommended', statusText: 'Good Visibility' },
    { time: '14:00', label: '2 PM', temp: '34°C', rain: '45%', status: 'caution', statusText: 'Slick Road Risk' },
    { time: '16:00', label: '4 PM', temp: '31°C', rain: '35%', status: 'caution', statusText: 'Pre-Rush Delay' },
    { time: '18:00', label: '6 PM', temp: '27°C', rain: '30%', status: 'avoid', statusText: 'Peak Expressway' },
    { time: '20:00', label: '8 PM', temp: '25°C', rain: '15%', status: 'recommended', statusText: 'Corridor Cleared' },
  ],
  agriculture: [
    { time: '06:00', label: '6 AM', temp: '22°C', rain: '10%', status: 'recommended', statusText: 'Calm Spray' },
    { time: '08:00', label: '8 AM', temp: '25°C', rain: '15%', status: 'recommended', statusText: 'Dew Drying' },
    { time: '10:00', label: '10 AM', temp: '29°C', rain: '20%', status: 'recommended', statusText: 'Field Work' },
    { time: '12:00', label: '12 PM', temp: '33°C', rain: '25%', status: 'avoid', statusText: 'High Evaporation' },
    { time: '14:00', label: '2 PM', temp: '34°C', rain: '40%', status: 'avoid', statusText: 'Wind Drift' },
    { time: '16:00', label: '4 PM', temp: '31°C', rain: '30%', status: 'caution', statusText: 'Soil Cooling' },
    { time: '18:00', label: '6 PM', temp: '27°C', rain: '20%', status: 'recommended', statusText: 'Irrigation' },
    { time: '20:00', label: '8 PM', temp: '25°C', rain: '10%', status: 'recommended', statusText: 'Favorable Night' },
  ],
};

export default function BestHoursTimeline({ persona = 'fitness' }) {
  const [selectedHour, setSelectedHour] = useState(null);

  const hourlySlots = useMemo(() => {
    const key = persona?.toLowerCase();
    return PERSONA_SLOTS[key] || PERSONA_SLOTS.fitness;
  }, [persona]);

  return (
    <div className="best-hours-section">
      <div className="best-hours-header">
        <div className="header-title-group">
          <Clock size={16} className="text-emerald" />
          <h3 className="section-title">Hourly Condition Timeline ({persona.toUpperCase()})</h3>
        </div>
        <div className="legend-pills">
          <span className="legend-dot green">Favorable</span>
          <span className="legend-dot amber">Caution</span>
          <span className="legend-dot red">Avoid</span>
        </div>
      </div>

      <div className="timeline-scroll-track" role="list">
        {hourlySlots.map((slot, index) => {
          const isSelected = selectedHour?.time === slot.time;
          return (
            <div
              key={index}
              className={`timeline-slot-card status-${slot.status} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedHour(slot)}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedHour(slot); }}
            >
              <span className="slot-time">{slot.label}</span>
              <div className={`status-indicator-bar ${slot.status}`}></div>
              <span className="slot-temp">{slot.temp}</span>
              <span className="slot-rain">🌧 {slot.rain}</span>
              <span className="slot-status-tag">{slot.statusText}</span>
            </div>
          );
        })}
      </div>

      {selectedHour && (
        <div className="timeline-detail-popup">
          <Info size={16} className="text-sky inline-icon" />
          <span>
            <strong>{selectedHour.label} Conditions:</strong> {selectedHour.temp}, {selectedHour.rain} rain risk. Status:{' '}
            <strong className={`text-${selectedHour.status === 'recommended' ? 'emerald' : selectedHour.status === 'caution' ? 'amber' : 'rose'}`}>
              {selectedHour.statusText}
            </strong>.
          </span>
        </div>
      )}
    </div>
  );
}
