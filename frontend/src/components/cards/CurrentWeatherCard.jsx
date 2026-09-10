import React from 'react';
import { CloudRain, Wind, Droplets, Gauge, Thermometer } from 'lucide-react';

export default function CurrentWeatherCard({ data, title }) {
  if (!data) return null;

  const {
    city,
    temperature_c,
    feels_like_c,
    condition,
    rainfall_mm,
    humidity_percent,
    wind_speed_kmh,
    aqi,
  } = data;

  const getAqiBadge = (val) => {
    if (val <= 50) return { label: 'Good', bg: 'bg-emerald-100 text-emerald-800' };
    if (val <= 100) return { label: 'Moderate', bg: 'bg-lime-100 text-lime-800' };
    if (val <= 150) return { label: 'Unhealthy for Sensitive', bg: 'bg-amber-100 text-amber-800' };
    if (val <= 200) return { label: 'Unhealthy', bg: 'bg-orange-100 text-orange-800' };
    return { label: 'Severe', bg: 'bg-rose-100 text-rose-800' };
  };

  const aqiBadge = getAqiBadge(aqi);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title || 'Current Weather Overview'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">{city || 'Weather Station'}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-slate-500">Condition</span>
          <div className="font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg text-xs mt-0.5 border border-sky-100">
            {condition || 'Clear Sky'}
          </div>
        </div>
      </div>

      {/* Main Temp & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
            {temperature_c}°
          </span>
          <span className="text-slate-400 text-sm font-semibold">C</span>
          <span className="text-xs text-slate-500 ml-2 font-medium">
            Feels like <strong className="text-slate-800">{feels_like_c}°C</strong>
          </span>
        </div>

        {/* 4 Metric Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Droplets className="w-4 h-4 text-sky-500" />
            <div>
              <span className="text-slate-400 text-[10px] block">Humidity</span>
              <span className="font-bold text-slate-800">{humidity_percent}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <CloudRain className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-slate-400 text-[10px] block">Rainfall</span>
              <span className="font-bold text-slate-800">{rainfall_mm} mm</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Wind className="w-4 h-4 text-teal-500" />
            <div>
              <span className="text-slate-400 text-[10px] block">Wind Speed</span>
              <span className="font-bold text-slate-800">{wind_speed_kmh} km/h</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Gauge className="w-4 h-4 text-purple-500" />
            <div>
              <span className="text-slate-400 text-[10px] block">AQI Index</span>
              <span className="font-bold text-slate-800 mr-1.5">{aqi}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${aqiBadge.bg}`}>
                {aqiBadge.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
