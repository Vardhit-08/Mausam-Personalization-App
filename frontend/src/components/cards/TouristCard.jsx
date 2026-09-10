import React from 'react';
import { Compass, Umbrella, Sun, Eye, Info } from 'lucide-react';

export default function TouristCard({ data }) {
  if (!data) return null;

  const {
    sightseeing_score,
    comfort_category,
    rainfall_mm,
    uv_index,
    visibility_km,
    travel_advice,
    carry_umbrella,
    sun_protection_needed,
  } = data;

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-700';
    if (score >= 45) return 'text-amber-700';
    return 'text-rose-700';
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Tourist Sightseeing & Comfort</h3>
            <span className="text-[11px] text-amber-700 font-semibold">Traveler Decision Card</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Sightseeing Score</span>
          <span className={`text-lg font-extrabold ${getScoreColor(sightseeing_score)}`}>
            {sightseeing_score}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* Travel Advice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-4 text-xs text-amber-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Excursion Guidance:</span>
          {travel_advice}
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Umbrella className="w-3.5 h-3.5 text-sky-600" />
            <span>Umbrella</span>
          </div>
          <span className={`font-bold ${carry_umbrella ? 'text-rose-600' : 'text-emerald-700'}`}>
            {carry_umbrella ? 'Required ☂️' : 'Not needed'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>UV Radiation</span>
          </div>
          <span className="font-bold text-slate-800">
            {uv_index} UV {sun_protection_needed && '☀️ SPF+'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span>Visibility</span>
          </div>
          <span className="font-bold text-slate-800">
            {visibility_km} km
          </span>
        </div>
      </div>
    </div>
  );
}
