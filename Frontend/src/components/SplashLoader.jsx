/**
 * SplashLoader.jsx
 * 
 * Official IMD Mausam Application Entry Sequence.
 * 
 * Sequence Flow (Restrained, Professional & Institutional):
 * Stage 1: Government of India & IMD Identity
 *    ↓ Soft crossfade
 * Stage 2: Mausam Identity & Subtle Wordmark Entrance
 *    ↓ Smooth transition
 * Stage 3 / Complete: Enter Application
 * 
 * Respects prefers-reduced-motion, provides immediate skip option,
 * and maintains official branding without artificial delays or particle effects.
 */

import React, { useState, useEffect } from 'react';
import govLogo from '../assets/branding/gov-logo.png';
import imdLogo from '../assets/branding/imd-logo.png';

export default function SplashLoader({ onComplete, autoAdvance = true, message = 'Initializing Mausam...' }) {
  const [stage, setStage] = useState(1); // 1 = IMD / Govt, 2 = Mausam Identity, 3 = Transition out
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && onComplete) {
      // Rapid exit for users with reduced motion preference
      const instantTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(instantTimer);
    }

    if (!autoAdvance || !onComplete) return;

    let timer;
    if (stage === 1) {
      timer = setTimeout(() => setStage(2), 1100);
    } else if (stage === 2) {
      timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onComplete();
        }, 350);
      }, 1200);
    }

    return () => clearTimeout(timer);
  }, [stage, autoAdvance, onComplete]);

  const handleSkip = () => {
    if (onComplete) {
      setIsExiting(true);
      setTimeout(onComplete, 150);
    } else if (stage < 2) {
      setStage(2);
    }
  };

  // Minimal route fallback loader if no onComplete provided
  if (!onComplete) {
    return (
      <div className="splash-route-fallback-container" role="status" aria-label="Loading">
        <div className="splash-fallback-card">
          <img src={imdLogo} alt="IMD Logo" className="splash-fallback-logo" />
          <div className="splash-fallback-text">
            <span className="splash-fallback-title">मौसम MAUSAM</span>
            <span className="splash-fallback-sub">{message}</span>
          </div>
          <div className="splash-fallback-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`splash-experience-container ${isExiting ? 'splash-exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Official Mausam Application Entry"
      onClick={handleSkip}
    >
      <div className="splash-subtle-gradient" aria-hidden="true" />

      <div className="splash-screen-card" onClick={(e) => e.stopPropagation()}>
        {/* STAGE 1: Government of India + India Meteorological Department */}
        {stage === 1 && (
          <div className="splash-stage stage-1" key="stage-1">
            <div className="splash-gov-emblem-wrap">
              <img src={govLogo} alt="Government of India Emblem" className="splash-gov-logo" />
            </div>
            <div className="splash-text-block">
              <span className="splash-gov-hindi">भारत सरकार</span>
              <h2 className="splash-gov-title">Government of India</h2>
              <span className="splash-moes-title">Ministry of Earth Sciences</span>
            </div>

            <div className="splash-divider-line" />

            <div className="splash-imd-emblem-wrap">
              <img src={imdLogo} alt="India Meteorological Department Emblem" className="splash-imd-logo" />
              <div className="splash-imd-text">
                <span className="splash-imd-hindi">भारत मौसम विज्ञान विभाग</span>
                <h3 className="splash-imd-title">India Meteorological Department</h3>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: Mausam Identity & Subtle Wordmark Entrance */}
        {stage === 2 && (
          <div className="splash-stage stage-2" key="stage-2">
            <div className="splash-mausam-logo-box">
              <img src={imdLogo} alt="IMD Official Logo" className="splash-mausam-logo" />
            </div>
            <h1 className="splash-mausam-wordmark">मौसम MAUSAM</h1>
            <p className="splash-mausam-subtitle">National Weather Personalization Engine</p>
            <span className="splash-mausam-author">India Meteorological Department</span>
          </div>
        )}

        {/* Subtle Skip / Advance Control */}
        <div className="splash-footer-control">
          <div className="splash-stage-dots" aria-hidden="true">
            <span className={`splash-dot ${stage === 1 ? 'active' : ''}`} />
            <span className={`splash-dot ${stage === 2 ? 'active' : ''}`} />
          </div>
          <button
            type="button"
            className="splash-skip-link"
            onClick={handleSkip}
            title="Skip directly to application"
          >
            Enter Mausam →
          </button>
        </div>
      </div>
    </div>
  );
}
