import React from 'react';
import { Users, HeartPulse, Bus, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ParentCard({ data }) {
  if (!data) return null;

  const {
    child_safety_score,
    school_commute_status,
    health_notice,
    aqi_level,
    carry_child_rainwear,
    extreme_weather_flag,
  } = data;

  const isSafe = child_safety_score >= 70;

  return (
    <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Child Outdoor Safety & School Commute</h3>
            <span className="text-[11px] text-rose-700 font-semibold">Family Decision Card</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Child Safety Score</span>
          <span className={`text-lg font-extrabold ${isSafe ? 'text-emerald-700' : 'text-rose-700'}`}>
            {child_safety_score}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* School Commute Status */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Bus className="w-4 h-4 text-sky-600" />
          <span className="font-bold text-slate-800">School Commute & Bus:</span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
          school_commute_status?.toLowerCase().includes('caution') ||
          school_commute_status?.toLowerCase().includes('delay')
            ? 'bg-amber-100 text-amber-900'
            : 'bg-emerald-100 text-emerald-900'
        }`}>
          {school_commute_status}
        </span>
      </div>

      {/* Child Health Notice */}
      <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 mb-3 text-xs text-rose-950 flex items-start gap-2.5">
        <HeartPulse className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Health & Respiratory Advisory:</span>
          {health_notice}
        </div>
      </div>

      {/* Rainwear & Caution flags */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1.5">
          {carry_child_rainwear ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Equip children with rainwear
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              No extra rain gear needed
            </>
          )}
        </span>

        {extreme_weather_flag && (
          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
            Severe Warning Active
          </span>
        )}
      </div>
    </div>
  );
}
