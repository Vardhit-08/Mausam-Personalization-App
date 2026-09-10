/**
 * DynamicCardGrid.jsx
 * 
 * Dynamically Prioritized Weather Indicators for SIH26076 Mausam.
 * 
 * Features:
 * - Cards sort dynamically by computed relevance score (highest relevance first).
 * - Priority badge showing the relevance score (e.g. 95/100).
 * - Subtle "Why am I seeing this?" info toggle on each card.
 * - Responsive multi-column grid.
 */

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function DynamicCardGrid({ cards = [] }) {
  const [expandedWhyId, setExpandedWhyId] = useState(null);

  const toggleWhy = (cardId, e) => {
    e.stopPropagation();
    setExpandedWhyId(expandedWhyId === cardId ? null : cardId);
  };

  return (
    <div className="dynamic-card-grid-section" id="tour-indices-section">
      <div className="section-header-row">
        <div>
          <h3 className="grid-section-title">Prioritized Weather Indicators</h3>
          <p className="grid-section-sub">
            Ranked dynamically by your active profile, severity, and local environmental context.
          </p>
        </div>
      </div>

      <div className="cards-grid-layout">
        {cards.map((card) => {
          const isWhyOpen = expandedWhyId === card.id;
          return (
            <div key={card.id} className="prioritized-card">
              <div className="card-top-row">
                <h4 className="card-title">{card.title}</h4>
                <div className="card-relevance-pill" title={`Dynamic Relevance: ${card.relevance}/100`}>
                  <span className="pill-dot"></span>
                  <span>Priority {card.relevance}</span>
                </div>
              </div>

              <div className="card-content-area">
                {card.type === 'RUNNING_TIMELINE' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-sky">{card.content.window}</div>
                    <div className="stat-sub-label">Comfort Score: {card.content.score} ({card.content.status})</div>
                    {card.content.advice && <p className="card-advice-snippet">{card.content.advice}</p>}
                  </div>
                )}

                {card.type === 'SWEAT_RISK' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-amber">{card.content.score}</div>
                    <div className="stat-sub-label">Perspiration Risk: {card.content.category}</div>
                    <p className="card-advice-snippet">{card.content.advice}</p>
                  </div>
                )}

                {card.type === 'TRAVEL_DESTINATION' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-indigo">{card.content.destination}</div>
                    <div className="stat-sub-label">{card.content.forecast}</div>
                    <p className="card-advice-snippet">🧳 {card.content.packing}</p>
                  </div>
                )}

                {card.type === 'COMMUTE_RISK' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-rose">Visibility: {card.content.visibility}</div>
                    <div className="stat-sub-label">Hazard Level: {card.content.risk}</div>
                    <p className="card-advice-snippet">{card.content.advisory || card.content.advice}</p>
                  </div>
                )}

                {card.type === 'AQI_POLLEN' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-emerald">AQI {card.content.aqi}</div>
                    <div className="stat-sub-label">Category: {card.content.category} • Pollen: {card.content.pollen}</div>
                    {card.content.advice && <p className="card-advice-snippet">{card.content.advice}</p>}
                  </div>
                )}

                {card.type === 'UV_INDEX' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-amber">UV {card.content.uv}</div>
                    <div className="stat-sub-label">Category: {card.content.category} • Unshaded burn: {card.content.burnTime}</div>
                    {card.content.advice && <p className="card-advice-snippet">{card.content.advice}</p>}
                  </div>
                )}

                {card.type === 'RAIN_PROBABILITY' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-blue">{card.content.probability}</div>
                    <div className="stat-sub-label">Precipitation Accumulation: {card.content.amountMm}</div>
                    {card.content.advice && <p className="card-advice-snippet">{card.content.advice}</p>}
                  </div>
                )}

                {card.type === 'AGRI_SOIL' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-emerald">{card.content.moisture}</div>
                    <div className="stat-sub-label">Root Depth: {card.content.depth} • Status: {card.content.status}</div>
                    <p className="card-advice-snippet">{card.content.advice}</p>
                  </div>
                )}

                {card.type === 'AGRI_SPRAY' && (
                  <div className="metric-stat-box">
                    <div className="stat-large-val text-teal">{card.content.window}</div>
                    <div className="stat-sub-label">Wind Velocity: {card.content.wind} • Drift Risk: {card.content.driftRisk}</div>
                    <p className="card-advice-snippet">{card.content.advice}</p>
                  </div>
                )}
              </div>

              {/* Card Footer with Why am I seeing this? */}
              <div className="card-footer-action">
                <button
                  type="button"
                  className="btn-card-why"
                  onClick={(e) => toggleWhy(card.id, e)}
                  aria-expanded={isWhyOpen}
                >
                  <Info size={13} />
                  <span>Why this priority?</span>
                  {isWhyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {isWhyOpen && (
                <div className="card-why-drawer" role="region" aria-label={`Priority rationale for ${card.title}`}>
                  <p>{card.why}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
