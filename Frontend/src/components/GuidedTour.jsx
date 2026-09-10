import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lightbulb, ChevronRight, ChevronLeft, X, Check } from 'lucide-react';

export function isTourCompleted() {
  return typeof window !== 'undefined' && localStorage.getItem('mausam_tour_completed') === 'true';
}

export function setTourCompleted(completed = true) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mausam_tour_completed', completed ? 'true' : 'false');
  }
}

export const TOUR_STEPS = [
  {
    targetId: 'tour-persona-switcher',
    title: 'Personalized Persona Selector',
    explanation: 'Switches the entire homepage between Outdoor Fitness, Traveler, Health & Wellness, and Commuter.',
    utility: 'Mausam understands who you are and prioritizes relevant meteorological risks over raw generic data.',
  },
  {
    targetId: 'tour-mode-toggle',
    title: 'Personalized vs. Generic Mode',
    explanation: 'Toggle between computed actionable recommendations and standard IMD raw observations.',
    utility: 'Demonstrates the power of algorithmic interpretation vs. conventional weather websites.',
  },
  {
    targetId: 'tour-insight-card',
    title: 'Persona Insight & Actionable Score',
    explanation: 'Combines multiple weather variables into an overall readiness score and plain-English guidance.',
    utility: 'Never makes you interpret 5-10 raw numbers yourself — tells you what conditions mean right now.',
  },
  {
    targetId: 'tour-indices-section',
    title: 'Dynamic Cards & Best Hours Timeline',
    explanation: 'Shows algorithmic indicators (Sweat Risk, Commute Hazard, Outdoor Comfort) and optimal time windows.',
    utility: 'Dynamically reorders based on current severity and highlights the safest hours for your routine.',
  },
  {
    targetId: 'tour-notification-center',
    title: 'Proactive Context-Aware Alerts',
    explanation: 'Monitors real-time environmental shifts and alerts you before conditions affect your day.',
    utility: 'Equipped with alert fatigue protection to ensure you only receive meaningful, non-repetitive warnings.',
  },
];

export default function GuidedTour({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [dialogStyle, setDialogStyle] = useState({ top: 100, left: 16 });
  const rafRef = useRef(null);

  const measureAndPosition = useCallback(() => {
    const step = TOUR_STEPS[activeStep];
    if (!step) return;

    const el = document.getElementById(step.targetId);
    if (!el) {
      setTargetRect(null);
      setDialogStyle({
        top: Math.max(80, (window.innerHeight - 280) / 2),
        left: Math.max(16, (window.innerWidth - 440) / 2),
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    const dialogWidth = Math.min(440, window.innerWidth - 32);
    const dialogEstimatedHeight = 260;
    const headerHeight = 75;

    const targetCenterX = rect.left + rect.width / 2;
    let dialogLeft = targetCenterX - dialogWidth / 2;
    dialogLeft = Math.max(16, Math.min(window.innerWidth - dialogWidth - 16, dialogLeft));

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top - headerHeight;

    let dialogTop;
    if (spaceBelow >= dialogEstimatedHeight + 20) {
      dialogTop = rect.bottom + 14;
    } else if (spaceAbove >= dialogEstimatedHeight + 20) {
      dialogTop = rect.top - dialogEstimatedHeight - 14;
    } else {
      dialogTop = Math.max(headerHeight + 10, window.innerHeight - dialogEstimatedHeight - 20);
    }

    setDialogStyle({ top: dialogTop, left: dialogLeft });
  }, [activeStep]);

  useEffect(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[activeStep];
    if (!step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const headerOffset = 80;
      if (rect.top < headerOffset || rect.bottom > window.innerHeight - 40) {
        const targetScrollTop = window.scrollY + rect.top - headerOffset - 20;
        window.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      }
    }

    measureAndPosition();
    const t1 = setTimeout(measureAndPosition, 100);
    const t2 = setTimeout(measureAndPosition, 250);
    const t3 = setTimeout(measureAndPosition, 450);
    const t4 = setTimeout(measureAndPosition, 650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, activeStep, measureAndPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureAndPosition);
    };

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, measureAndPosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setTourCompleted(true);
        setActiveStep(0);
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStepData = TOUR_STEPS[activeStep] || TOUR_STEPS[0];
  const isFirst = activeStep === 0;
  const isLast = activeStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    setTourCompleted(true);
    setActiveStep(0);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    setTourCompleted(true);
    setActiveStep(0);
    if (onClose) onClose();
  };

  return (
    <div className="guided-tour-backdrop" role="dialog" aria-modal="true" aria-label="First-Time Guided Tour">
      {targetRect && (
        <div
          className="tour-spotlight-box"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          <div className="tour-spotlight-pulse"></div>
        </div>
      )}

      <div
        className="tour-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-dialog-title"
        style={{
          top: `${dialogStyle.top}px`,
          left: `${dialogStyle.left}px`,
        }}
      >
        <div className="tour-card-header">
          <div className="tour-bulb-group">
            <div className="tour-bulb-icon-container" aria-hidden="true">
              <Lightbulb className="tour-bulb-icon" size={24} />
            </div>
            <div>
              <span className="tour-step-pill">
                Feature {activeStep + 1} of {TOUR_STEPS.length}
              </span>
              <h3 id="tour-dialog-title" className="tour-title">{currentStepData.title}</h3>
            </div>
          </div>
          <button
            type="button"
            className="tour-close-btn"
            onClick={handleSkip}
            aria-label="Close guided tour"
            id="tour-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        <div className="tour-card-body">
          <p className="tour-explanation">{currentStepData.explanation}</p>
          <div className="tour-utility-box">
            <strong>Why it matters:</strong> {currentStepData.utility}
          </div>
        </div>

        <div className="tour-card-footer">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleSkip}
            id="tour-skip-btn"
          >
            Skip Tour
          </button>

          <div className="tour-nav-btns">
            {!isFirst && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handlePrev}
                id="tour-prev-btn"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleNext}
              id="tour-next-btn"
            >
              <span>{isLast ? 'Finish Tour' : 'Next'}</span>
              {isLast ? <Check size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
