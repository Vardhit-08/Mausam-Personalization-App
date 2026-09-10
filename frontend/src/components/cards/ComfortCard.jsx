import React from 'react';
import { Smile, Frown, Meh, Thermometer } from 'lucide-react';

export default function ComfortCard({ data }) {
  if (!data) return null;

  const {
    comfort_score,
    category,
    heat_index_c,
    temperature_c,
    humidity_percent,
  } = data;

  const getStatusDisplay = (cat) => {
    switch (cat) {
      case 'Optimal':
        return { icon: Smile, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', text: 'Optimal Comfort' };
      case 'Pleasant':
        return { icon: Smile, color: 'text-teal-700 bg-teal-50 border-teal-200', text: 'Pleasant & Mild' };
      case 'Uncomfortable':
        return { icon: Meh, color: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Uncomfortable' };
      default:
        return { icon: Frown, color: 'text-rose-700 bg-rose-50 border-rose-200', text: 'Very Uncomfortable' };
    }
  };

  const status = getStatusDisplay(category);
  const StatusIcon = status.icon;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Thermal Comfort Index</h3>
            <span className="text-[11px] text-slate-500 font-semibold">Heat Index & Humidity Regression</span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${status.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.text}
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Comfort Score</span>
          <span className="text-xl font-extrabold text-slate-900">{comfort_score}</span>
          <span className="text-slate-400 font-normal"> / 100</span>
        </div>

        <div className="text-right">
          <span className="text-slate-400 block text-[11px]">Effective Heat Index</span>
          <span className="text-xl font-extrabold text-slate-900">{heat_index_c}°</span>
          <span className="text-slate-400 font-normal">C (apparent heat)</span>
        </div>
      </div>
    </div>
  );
}
