import React from 'react';
import { GraduationCap, ShieldCheck, Umbrella, Activity, AlertCircle } from 'lucide-react';

export default function StudentCard({ data }) {
  if (!data) return null;

  const {
    commute_ease_score,
    weather_condition,
    rain_protection_required,
    outdoor_sports_safe,
    study_activity_advice,
    aqi,
  } = data;

  const getScoreBadge = (score) => {
    if (score >= 70) return { text: 'Smooth Commute', bg: 'bg-indigo-100 text-indigo-800' };
    if (score >= 45) return { text: 'Minor Transit Delays', bg: 'bg-amber-100 text-amber-800' };
    return { text: 'Severe Delays / Waterlogging', bg: 'bg-rose-100 text-rose-800' };
  };

  const badge = getScoreBadge(commute_ease_score);

  return (
    <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Campus & Commute Advisory</h3>
            <span className="text-[11px] text-indigo-700 font-semibold">Student Decision Card</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Commute Ease</span>
          <span className="text-lg font-extrabold text-indigo-700">
            {commute_ease_score}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* Transit Advisory */}
      <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 mb-4 text-xs text-indigo-950 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Commute Advice:</span>
          {study_activity_advice}
        </div>
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Umbrella className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-semibold text-slate-700">Rain Gear Requirement</span>
          </div>
          <span className="font-bold text-slate-900 block mt-0.5">
            {rain_protection_required}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-700">Outdoor Sports & Ground</span>
          </div>
          <span className={`font-bold block mt-0.5 ${outdoor_sports_safe ? 'text-emerald-700' : 'text-rose-600'}`}>
            {outdoor_sports_safe ? 'Safe for outdoor games' : 'Avoid outdoor games (Wet / High AQI)'}
          </span>
        </div>
      </div>
    </div>
  );
}
