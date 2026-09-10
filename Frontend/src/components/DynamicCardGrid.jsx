import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Wind, CloudRain, Sun, Activity, AlertTriangle, Luggage, Sprout } from 'lucide-react';

export default function DynamicCardGrid({ cards = [] }) {
  const [expandedWhyId, setExpandedWhyId] = useState(null);

  const toggleWhy = (cardId, e) => {
    e.stopPropagation();
    setExpandedWhyId(expandedWhyId === cardId ? null : cardId);
  };

  return (
    <div className="dynamic-card-grid-section" id="tour-indices-section">
      <div className="cards-structured-layout">
        {cards.map((card) => {
          const isWhyOpen = expandedWhyId === card.id;
          return (
            <article key={card.id} className="indicator-item-container">
              <div className="indicator-meta-header">
                <div className="indicator-title-group">
                  <h4 className="indicator-title">{card.title}</h4>
                </div>
                <div className="card-relevance-pill" title={`Dynamic Priority: ${card.relevance}/100`}>
                  <span className="pill-dot"></span>
                  <span>Priority {card.relevance}</span>
                </div>
              </div>

              {/* DIVERSIFIED STRUCTURAL CONTENT BY INFORMATION TYPE (PART E) */}
              <div className="indicator-body-content">
                {/* 1. AQI & Environmental Quality: Compact Horizontal Gauge */}
                {card.type === 'AQI_POLLEN' && (
                  <div className="aqi-compact-visual">
                    <div className="aqi-headline-strip">
                      <span className="aqi-number">AQI {card.content.aqi}</span>
                      <span className="aqi-category-tag">{card.content.category}</span>
                      <span className="aqi-pollutant-tag">Pollen: {card.content.pollen}</span>
                    </div>
                    <div className="aqi-spectrum-bar" aria-hidden="true">
                      <div
                        className="aqi-spectrum-indicator"
                        style={{ left: `${Math.min(100, (card.content.aqi / 300) * 100)}%` }}
                      />
                    </div>
                    {card.content.advice && <p className="indicator-action-note">{card.content.advice}</p>}
                  </div>
                )}

                {/* 2. UV Solar Radiation: Compact Indicator with Burn Time */}
                {card.type === 'UV_INDEX' && (
                  <div className="uv-compact-indicator">
                    <div className="uv-metric-row">
                      <div className="uv-badge-box">
                        <Sun size={18} className="text-amber" />
                        <span className="uv-level-bold">UV {card.content.uv}</span>
                      </div>
                      <div className="uv-burn-notice">
                        <span className="uv-category-name">{card.content.category} Radiation</span>
                        <span className="uv-burn-timer">Burn risk in {card.content.burnTime} unshaded</span>
                      </div>
                    </div>
                    {card.content.advice && <p className="indicator-action-note">{card.content.advice}</p>}
                  </div>
                )}

                {/* 3. Commute Risk: Dedicated Hazard Alert Banner */}
                {card.type === 'COMMUTE_RISK' && (
                  <div className="commute-hazard-banner">
                    <div className="hazard-header-strip">
                      <AlertTriangle size={18} className="text-rose" />
                      <span className="hazard-status-title">Hazard Level: {card.content.risk}</span>
                      <span className="hazard-visibility-badge">Visibility: {card.content.visibility}</span>
                    </div>
                    <p className="hazard-action-text">{card.content.advisory || card.content.advice}</p>
                  </div>
                )}

                {/* 4. Travel Destination: Transit Summary with Packing List */}
                {card.type === 'TRAVEL_DESTINATION' && (
                  <div className="travel-destination-panel">
                    <div className="travel-destination-header">
                      <span className="travel-dest-name">{card.content.destination}</span>
                      <span className="travel-forecast-badge">{card.content.forecast}</span>
                    </div>
                    <div className="travel-packing-row">
                      <Luggage size={15} className="text-sky" />
                      <span className="packing-tip-text">Packing Guidance: {card.content.packing}</span>
                    </div>
                  </div>
                )}

                {/* 5. Running & Workout Window: Text-led Timing Window */}
                {card.type === 'RUNNING_TIMELINE' && (
                  <div className="timeline-window-callout">
                    <div className="window-time-row">
                      <Activity size={16} className="text-sky" />
                      <span className="window-time-slot">{card.content.window}</span>
                      <span className="window-rating-pill">Rating: {card.content.score} ({card.content.status})</span>
                    </div>
                    {card.content.advice && <p className="indicator-action-note">{card.content.advice}</p>}
                  </div>
                )}

                {/* 6. Sweat & Hydration Risk: Rate Metric with Intake Target */}
                {card.type === 'SWEAT_RISK' && (
                  <div className="sweat-hydration-block">
                    <div className="sweat-rate-row">
                      <span className="sweat-rate-score">Loss: {card.content.score}</span>
                      <span className="sweat-category-badge">{card.content.category} Rate</span>
                    </div>
                    <p className="indicator-action-note">{card.content.advice}</p>
                  </div>
                )}

                {/* 7. Precipitation Likelihood: Inline Rain Gauge */}
                {card.type === 'RAIN_PROBABILITY' && (
                  <div className="rain-probability-strip">
                    <div className="rain-metric-flex">
                      <CloudRain size={18} className="text-blue" />
                      <span className="rain-percent-val">{card.content.probability} Rain Probability</span>
                      <span className="rain-accum-tag">Accumulation: {card.content.amountMm}</span>
                    </div>
                    {card.content.advice && <p className="indicator-action-note">{card.content.advice}</p>}
                  </div>
                )}

                {/* 8. Agricultural Soil Moisture: Root Depth Status */}
                {card.type === 'AGRI_SOIL' && (
                  <div className="agri-soil-block">
                    <div className="soil-metric-row">
                      <Sprout size={18} className="text-emerald" />
                      <span className="soil-val-bold">{card.content.moisture} Soil Moisture</span>
                      <span className="soil-depth-badge">Depth: {card.content.depth} ({card.content.status})</span>
                    </div>
                    <p className="indicator-action-note">{card.content.advice}</p>
                  </div>
                )}

                {/* 9. Agricultural Spray Window: Drift Risk Operational Row */}
                {card.type === 'AGRI_SPRAY' && (
                  <div className="agri-spray-block">
                    <div className="spray-window-row">
                      <Wind size={16} className="text-teal" />
                      <span className="spray-slot-bold">{card.content.window}</span>
                      <span className="drift-risk-tag">Wind: {card.content.wind} • {card.content.driftRisk}</span>
                    </div>
                    <p className="indicator-action-note">{card.content.advice}</p>
                  </div>
                )}
              </div>

              {/* Rationale Drawer Button */}
              <div className="card-footer-action">
                <button
                  type="button"
                  className="btn-card-why"
                  onClick={(e) => toggleWhy(card.id, e)}
                  aria-expanded={isWhyOpen}
                  id={`btn-why-${card.id}`}
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
            </article>
          );
        })}
      </div>
    </div>
  );
}