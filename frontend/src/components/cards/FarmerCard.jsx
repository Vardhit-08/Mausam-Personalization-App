import React from 'react';
import { Sprout, Droplets, ThermometerSun, AlertTriangle, CheckCircle } from 'lucide-react';

export default function FarmerCard({ data }) {
  if (!data) return null;

  const {
    farming_suitability_score,
    soil_moisture_m3,
    soil_moisture_status,
    soil_temperature_c,
    irrigation_recommendation,
    frost_risk,
    heat_stress,
  } = data;

const isOptimal = soil_moisture_status?.toLowerCase().includes('optimal');

  return (
    <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Agromet Soil & Crop Guidance</h3>
            <span className="text-[11px] text-emerald-700 font-semibold">Agricultural Decision Card</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Suitability Score</span>
          <span className="text-lg font-extrabold text-emerald-700">
            {farming_suitability_score}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* Soil Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-emerald-600" />
              Soil Moisture
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isOptimal ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
            }`}>
              {soil_moisture_status}
            </span>
          </div>
          <span className="text-xl font-extrabold text-emerald-950">{soil_moisture_m3}</span>
          <span className="text-[10px] text-emerald-700 font-medium ml-1">m³/m³ (0-1cm depth)</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
            <ThermometerSun className="w-3.5 h-3.5 text-slate-500" />
            Topsoil Temp
          </span>
          <span className="text-xl font-extrabold text-slate-900">{soil_temperature_c}°</span>
          <span className="text-slate-500 text-xs">C</span>
        </div>
      </div>

      {/* Irrigation Recommendation */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-xs text-slate-700 flex items-start gap-2.5">
        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 block mb-0.5">Irrigation Guidance:</span>
          {irrigation_recommendation}
        </div>
      </div>

      {/* Warnings */}
      <div className="flex flex-wrap gap-2">
        {frost_risk && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-700" />
            Ground Frost Risk
          </span>
        )}
        {heat_stress && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-100 text-orange-900 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-700" />
            Crop Heat Stress
          </span>
        )}
        {!frost_risk && !heat_stress && (
          <span className="text-[11px] text-slate-400 font-medium italic">
            No extreme temperature alerts for field crops today.
          </span>
        )}
      </div>
    </div>
  );
}
