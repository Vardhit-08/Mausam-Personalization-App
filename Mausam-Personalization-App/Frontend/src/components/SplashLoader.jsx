/**
 * SplashLoader.jsx
 * 
 * Official IMD Mausam Application Entry / Splash Experience.
 * 
 * Screens:
 * - Screen 01: Government of India + India Meteorological Department identity.
 * - Screen 02: Mausam Unified Brand & IMD official emblem.
 * - Screen 03: Personalization Introduction ("India's own personalized weather app").
 * 
 * Features:
 * - Dynamic atmospheric weather theme (rain, storm, clouds, sunrise, wind, mist).
 * - Non-repeating shuffle-bag algorithm remembering last theme across launches.
 * - Seamless loop fallback, smooth crossfade transitions, responsive across mobile & desktop.
 * - Accessible controls (Skip / Continue buttons) with ARIA live announcements.
 */

import React, { useState, useEffect, useRef } from 'react';
import govLogo from '../assets/branding/gov-logo.png';
import imdLogo from '../assets/branding/imd-logo.png';
import { CloudRain, Sun, Wind, CloudLightning, Sparkles, ArrowRight } from 'lucide-react';

const WEATHER_THEMES = ['rain', 'storm', 'clouds', 'sunrise', 'wind', 'mist'];

/**
 * Pick next theme using a non-immediate repeating shuffle-bag
 */
function getNextWeatherTheme() {
  try {
    const lastTheme = localStorage.getItem('lastSplashBackground');
    const eligible = WEATHER_THEMES.filter((t) => t !== lastTheme);
    const nextTheme = eligible[Math.floor(Math.random() * eligible.length)] || 'rain';
    localStorage.setItem('lastSplashBackground', nextTheme);
    return nextTheme;
  } catch {
    return 'clouds';
  }
}

export default function SplashLoader({ onComplete, autoAdvance = true, _message = 'Initializing Mausam...' }) {
  const [currentScreen, setCurrentScreen] = useState(1); // 1, 2, or 3
  const [theme] = useState(() => getNextWeatherTheme());
  const canvasRef = useRef(null);

  // Auto-advance stages if enabled
  useEffect(() => {
    if (!autoAdvance) return;

    let timer;
    if (currentScreen === 1) {
      timer = setTimeout(() => setCurrentScreen(2), 1600);
    } else if (currentScreen === 2) {
      timer = setTimeout(() => setCurrentScreen(3), 1600);
    } else if (currentScreen === 3 && onComplete) {
      timer = setTimeout(() => {
        onComplete();
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [currentScreen, autoAdvance, onComplete]);

  // Atmospheric background canvas animation (rain, wind, mist, storm particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle system based on theme
    const particles = [];
    const count = theme === 'rain' ? 80 : theme === 'storm' ? 100 : 35;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 6 + 4,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let stormFlash = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (theme === 'rain' || theme === 'storm') {
        ctx.strokeStyle = theme === 'storm' ? 'rgba(200, 225, 255, 0.4)' : 'rgba(147, 197, 253, 0.35)';
        ctx.lineWidth = 1.5;
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + p.length);
          ctx.stroke();

          p.y += p.speed;
          p.x -= 1;
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        });

        // Occasional subtle lightning flash for storm
        if (theme === 'storm') {
          if (Math.random() < 0.01) stormFlash = 0.25;
          if (stormFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${stormFlash})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            stormFlash -= 0.03;
          }
        }
      } else if (theme === 'mist' || theme === 'clouds') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.length * 3, 0, Math.PI * 2);
          ctx.fill();
          p.x += 0.3;
          if (p.x > canvas.width + 50) p.x = -50;
        });
      } else if (theme === 'wind') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.15)';
        ctx.lineWidth = 1;
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length * 2, p.y);
          ctx.stroke();
          p.x += p.speed * 1.5;
          if (p.x > canvas.width) {
            p.x = -60;
            p.y = Math.random() * canvas.height;
          }
        });
      } else if (theme === 'sunrise') {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height * 0.85,
          10,
          canvas.width / 2,
          canvas.height * 0.85,
          canvas.width * 0.6
        );
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
        gradient.addColorStop(1, 'rgba(6, 25, 56, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const handleSkipOrProceed = () => {
    if (onComplete) {
      onComplete();
    } else if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  return (
    <div
      className={`splash-experience-container theme-${theme}`}
      role="dialog"
      aria-modal="true"
      aria-label="Application Entry"
    >
      {/* Background Canvas for Atmospheric Weather Effects */}
      <canvas ref={canvasRef} className="splash-ambient-canvas" aria-hidden="true" />
      <div className="splash-dark-overlay" aria-hidden="true" />

      {/* Weather Theme Kicker Indicator */}
      <div className="splash-theme-indicator">
        {theme === 'rain' && <CloudRain size={14} />}
        {theme === 'storm' && <CloudLightning size={14} />}
        {theme === 'sunrise' && <Sun size={14} />}
        {theme === 'wind' && <Wind size={14} />}
        <span>Atmospheric Theme: {theme.toUpperCase()}</span>
      </div>

      <div className="splash-screen-card">
        {/* SCREEN 01: Government of India + IMD Identity */}
        {currentScreen === 1 && (
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

        {/* SCREEN 02: Mausam Identity */}
        {currentScreen === 2 && (
          <div className="splash-stage stage-2" key="stage-2">
            <div className="splash-mausam-logo-box">
              <img src={imdLogo} alt="IMD Official Logo" className="splash-mausam-logo" />
            </div>
            <h1 className="splash-mausam-wordmark">मौसम MAUSAM</h1>
            <p className="splash-mausam-subtitle">Unified Weather Portal & Mobile Services</p>
            <span className="splash-mausam-author">India Meteorological Department</span>
          </div>
        )}

        {/* SCREEN 03: Personalization Introduction */}
        {currentScreen === 3 && (
          <div className="splash-stage stage-3" key="stage-3">
            <div className="splash-intro-badge">
              <Sparkles size={16} className="text-amber" />
              <span>SIH 26076 Personalization Layer</span>
            </div>

            <h2 className="splash-intro-heading">India&apos;s own personalized weather app</h2>
            <p className="splash-intro-sub">
              Powered by <strong>India Meteorological Department</strong> and the{' '}
              <strong>Ministry of Earth Sciences</strong>.
            </p>

            <p className="splash-intro-desc">
              Transforming raw meteorological indicators into actionable, plain-English guidance tailored to your daily
              routine, health, and commute.
            </p>

            <div className="splash-intro-action-row">
              <button
                type="button"
                className="btn btn-primary btn-lg splash-continue-btn"
                onClick={handleSkipOrProceed}
                id="splash-continue-btn"
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Stage Navigation Dots */}
        <div className="splash-dots-row">
          <button
            type="button"
            className={`splash-dot ${currentScreen === 1 ? 'active' : ''}`}
            onClick={() => setCurrentScreen(1)}
            aria-label="Screen 1: Government Identity"
          />
          <button
            type="button"
            className={`splash-dot ${currentScreen === 2 ? 'active' : ''}`}
            onClick={() => setCurrentScreen(2)}
            aria-label="Screen 2: Mausam Identity"
          />
          <button
            type="button"
            className={`splash-dot ${currentScreen === 3 ? 'active' : ''}`}
            onClick={() => setCurrentScreen(3)}
            aria-label="Screen 3: Personalization Intro"
          />
        </div>

        {/* Skip action for fast entry */}
        {currentScreen < 3 && (
          <button
            type="button"
            className="splash-skip-link"
            onClick={handleSkipOrProceed}
            id="splash-skip-btn"
          >
            Skip Intro →
          </button>
        )}
      </div>
    </div>
  );
}
