import React from 'react';
import { Sparkles, Layers } from 'lucide-react';

export default function ModeToggle({ mode = 'personalized', onToggleMode }) {
  return (
    <div className="mode-toggle-wrapper" id="tour-mode-toggle" role="group" aria-label="Mode Selection">
      <div className="mode-segmented-control">
        <button
          type="button"
          className={`btn-mode-segment ${mode === 'personalized' ? 'active' : ''}`}
          onClick={() => onToggleMode('personalized')}
          id="mode-toggle-personalized"
          aria-pressed={mode === 'personalized'}
        >
          <Sparkles size={14} className="segment-icon" />
          <span>Personalized</span>
        </button>

        <button
          type="button"
          className={`btn-mode-segment ${mode === 'generic' ? 'active' : ''}`}
          onClick={() => onToggleMode('generic')}
          id="mode-toggle-generic"
          aria-pressed={mode === 'generic'}
        >
          <Layers size={14} className="segment-icon" />
          <span>Generic IMD</span>
        </button>
      </div>
    </div>
  );
}
