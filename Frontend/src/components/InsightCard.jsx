/**
 * InsightCard.jsx
 * 
 * Primary Persona Insight Card for SIH26076 Mausam.
 * 
 * Features:
 * - Large persona-specific title.
 * - Prominent computed score (0-10) with horizontal semantic progress bar.
 * - Plain-English recommendation first.
 * - Best hours and avoid hours window.
 * - Supporting primary indicators.
 * - Expandable "Why am I seeing this?" modal / drawer explaining the exact factors.
 */

import React, { useState } from 'react';
import { Info, Clock, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function InsightCard({ insightData }) {
  const [showWhy, setShowWhy] = useState(false);

  if (!insightData || !insightData.title) return null;

  const scoreNum = parseFloat(insightData.score) || 7.0;
  // Progress bar percentage (0 - 100%)
  const barPercent = Math.max(5, Math.min(100, scoreNum * 10));

  // Determine status color class
  let barColorClass = 'bg-emerald';
  if (scoreNum < 4.0) barColorClass = 'bg-rose';
  else if (scoreNum < 7.0) barColorClass = 'bg-amber';

  return (
    <section className="insight-card-wrapper" id="tour-insight-card">
      <div className="insight-card-header">
        <div className="card-badge-row">
          <span className="insight-kicker">
            <Sparkles size={14} className="inline-icon text-amber" />
            <span>Mausam Algorithmic Synthesis</span>
          </span>
          <button
            type="button"
            className="btn-why-trigger"
            onClick={() => setShowWhy(!showWhy)}
            aria-expanded={showWhy}
            id="insight-why-btn"
          >
            <Info size={14} />
            <span>Why am I seeing this?</span>
            {showWhy ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        <h2 className="insight-main-title">{insightData.title}</h2>
      </div>

      {/* Expandable "Why am I seeing this?" Section */}
      {showWhy && (
        <div className="why-explanation-panel" role="region" aria-label="Why you are seeing this insight">
          <div className="why-content">
            <Info size={18} className="why-icon text-sky" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>Algorithmic Rationale & Synthesis</strong>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 600 }}>
                  Deterministic Model
                </span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.86rem', lineHeight: '1.45', color: '#cbd5e1' }}>{insightData.whyText}</p>

              {insightData.formula && (
                <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                    Formula / Model
                  </span>
                  <code style={{ fontSize: '0.78rem', color: '#7dd3fc', fontFamily: 'monospace' }}>
                    {insightData.formula}
                  </code>
                </div>
              )}

              {insightData.breakdown && Array.isArray(insightData.breakdown) && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Key Factor Breakdown
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {insightData.breakdown.map((item, idx) => (
                      <span key={idx} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                        <strong style={{ color: '#bae6fd' }}>{item.label}:</strong> {item.impact} {item.value ? `(${item.value})` : ''} {item.deduction ? `[${item.deduction}]` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                ℹ️ {insightData.disclaimer || 'Environmental decision-support indicator, not a medical or clinical diagnosis.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Visualization Bar */}
      <div className="score-visualization-section">
        <div className="score-header-row">
          <span className="score-label">{insightData.scoreLabel}</span>
          <div className="score-numeric-display">
            <span className="score-big">{insightData.score}</span>
            <span className="score-max">/ 10</span>
            <span className={`status-badge-inline ${insightData.statusColor || 'text-emerald'}`}>
              {insightData.status}
            </span>
          </div>
        </div>

        <div className="score-track-container" aria-label={`Readiness score: ${insightData.score} out of 10`}>
          <div className={`score-fill-bar ${barColorClass}`} style={{ width: `${barPercent}%` }}></div>
        </div>

        <div className="score-scale-labels">
          <span>0 (Unfavorable)</span>
          <span>5 (Moderate)</span>
          <span>10 (Optimal)</span>
        </div>
      </div>

      {/* Plain English Recommendation */}
      <div className="plain-english-headline-box">
        <p className="headline-text">{insightData.headline}</p>
      </div>

      {/* Optimal vs. Avoid Windows */}
      {(insightData.bestWindow || insightData.avoidWindow) && (
        <div className="time-windows-grid">
          {insightData.bestWindow && (
            <div className="time-window-pill best-window">
              <Clock size={16} className="text-emerald" />
              <div>
                <span className="window-label">Recommended Window</span>
                <strong className="window-val">{insightData.bestWindow}</strong>
              </div>
            </div>
          )}

          {insightData.avoidWindow && (
            <div className="time-window-pill avoid-window">
              <AlertCircle size={16} className="text-rose" />
              <div>
                <span className="window-label">Hours to Avoid / Caution</span>
                <strong className="window-val">{insightData.avoidWindow}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supporting Metric Tiles */}
      {insightData.metrics && (
        <div className="insight-metric-tiles-row">
          {insightData.metrics.map((m, idx) => (
            <div key={idx} className="insight-tile">
              <span className="tile-title">{m.label}</span>
              <span className="tile-value">{m.val}</span>
              <span className="tile-subtext">{m.sub}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
