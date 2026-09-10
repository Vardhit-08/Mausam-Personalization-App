import React from 'react';
import { PlayCircle, Sparkles } from 'lucide-react';

export const DEMO_SCENARIOS = [
  {
    id: 'A',
    label: 'A: Fitness (Normal)',
    persona: 'fitness',
    title: 'Scenario A: Fitness → Normal Conditions',
    desc: 'Clear weather, 29°C, 30% rain risk. Running window open.',
    overrides: {
      temperature: 29,
      humidity: 55,
      rainProbability: 25,
      visibility: 7,
      condition: 'Partly Cloudy',
    },
  },
  {
    id: 'B',
    label: 'B: Fitness (Sudden Rain)',
    persona: 'fitness',
    title: 'Scenario B: Fitness → Sudden Rain Approaching',
    desc: 'Rain chance spikes to 85%. Sweat risk drops, rain alert fires.',
    overrides: {
      temperature: 24,
      humidity: 88,
      rainProbability: 85,
      visibility: 3.5,
      condition: 'Heavy Rain',
    },
  },
  {
    id: 'C',
    label: 'C: Traveler (London)',
    persona: 'traveler',
    title: 'Scenario C: Traveler → Destination Overview',
    desc: 'Switches to Traveler. Evaluates packing tip and flight weather.',
    overrides: {
      destination: 'London',
      temperature: 18,
      humidity: 65,
      rainProbability: 35,
      visibility: 6,
      condition: 'Cloudy',
    },
  },
  {
    id: 'D',
    label: 'D: Traveler (Severe Storm)',
    persona: 'traveler',
    title: 'Scenario D: Traveler → Destination Storm Warning',
    desc: 'Severe storm forecasted at London. Destination alert triggers.',
    overrides: {
      destination: 'London',
      temperature: 16,
      humidity: 92,
      rainProbability: 90,
      visibility: 2.1,
      condition: 'Thunderstorm Warning',
    },
  },
  {
    id: 'E',
    label: 'E: Commuter (Morning)',
    persona: 'commuter',
    title: 'Scenario E: Commuter → Morning Fog',
    desc: 'Visibility drops to 2.4 km. Highway corridor hazard highlighted.',
    overrides: {
      temperature: 22,
      humidity: 82,
      rainProbability: 40,
      visibility: 2.4,
      condition: 'Dense Fog / Mist',
    },
  },
  {
    id: 'F',
    label: 'F: Commute (High Risk)',
    persona: 'commuter',
    title: 'Scenario F: Commuter → High Risk Storm Alert',
    desc: 'Heavy thunderstorm + low visibility. Commute risk becomes HIGH.',
    overrides: {
      temperature: 26,
      humidity: 90,
      rainProbability: 90,
      visibility: 1.8,
      condition: 'Severe Thunderstorm',
    },
  },
];

export default function DemoScenarioBar({ activeScenarioId, onSelectScenario }) {
  return (
    <div className="demo-scenario-bar">
      <div className="demo-scenario-container">
        <div className="scenario-intro">
          <div className="intro-badge">
            <Sparkles size={14} />
            <span>SIH Judge Demo Controller</span>
          </div>
          <span className="intro-hint">Click any scenario to watch reactive state recalculation:</span>
        </div>

        <div className="scenario-buttons-scroll">
          {DEMO_SCENARIOS.map((sc) => {
            const isActive = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                className={`btn-scenario ${isActive ? 'active' : ''}`}
                onClick={() => onSelectScenario(sc)}
                id={`demo-scenario-${sc.id.toLowerCase()}`}
                title={sc.desc}
              >
                <PlayCircle size={14} className="scenario-icon" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
