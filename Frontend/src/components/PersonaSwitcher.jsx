/**
 * PersonaSwitcher.jsx
 * 
 * Obvious and accessible persona selection tabs for SIH26076 Mausam.
 * Allows users to switch personas without having to leave the dashboard.
 */

import React from 'react';
import { PERSONAS } from '../services/personalizationEngine';

export default function PersonaSwitcher({ activePersona, onSelectPersona }) {
  const personaList = [
    { id: 'fitness', name: 'Outdoor Fitness', icon: '🏃' },
    { id: 'traveler', name: 'Traveler', icon: '✈️' },
    { id: 'health', name: 'Health & Wellness', icon: '🌿' },
    { id: 'commuter', name: 'Commuter', icon: '🚗' },
    { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
  ];

  return (
    <div className="persona-switcher-container" id="tour-persona-switcher" role="radiogroup" aria-label="Persona Switcher">
      <div className="switcher-label-row">
        <span className="switcher-label">Active Persona:</span>
        <span className="switcher-description">
          {PERSONAS[activePersona]?.shortDesc || 'Personalized weather intelligence'}
        </span>
      </div>

      <div className="persona-tabs-track">
        {personaList.map((p) => {
          const isSelected = activePersona === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`persona-tab-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectPersona(p.id)}
              id={`persona-tab-${p.id}`}
            >
              <span className="tab-icon" aria-hidden="true">{p.icon}</span>
              <span className="tab-name">{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
