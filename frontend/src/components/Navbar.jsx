import React from 'react';
import { CloudSun, Bell, User, MapPin, Sparkles } from 'lucide-react';

const CITIES = [
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Shimla', lat: 31.1048, lon: 77.1734 },
];

export default function Navbar({
  activeCity,
  onCityChange,
  activePersona,
  user,
  onOpenAuth,
  activeTab,
  onTabChange,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-100">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-lg tracking-tight">Mausam</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">2.0</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Personalized Weather Decision Layer</p>
            </div>
          </div>

          {/* Location & User profile */}
          <div className="flex items-center gap-3">
            {/* City Selector */}
            <div className="flex items-center bg-slate-100 hover:bg-slate-200/80 transition rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-sky-600 mr-1.5" />
              <select
                value={activeCity.name}
                onChange={(e) => {
                  const selected = CITIES.find((c) => c.name === e.target.value);
                  if (selected) onCityChange(selected);
                }}
                className="bg-transparent focus:outline-none cursor-pointer font-semibold text-slate-800"
              >
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Profile / Login Chip */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-sm text-xs font-medium text-slate-700"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                {user ? user.fullName?.charAt(0) || 'U' : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-800 line-clamp-1">
                  {user ? user.fullName : 'Guest'}
                </div>
                <div className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">
                  {user?.activePersona || activePersona}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-100 py-2 overflow-x-auto">
          {[
            { id: 'personalized', label: 'Personalized Feed', icon: Sparkles },
            { id: 'station', label: 'IMD Station Weather', icon: CloudSun },
            { id: 'alerts', label: 'Alert Simulator', icon: Bell },
            { id: 'packing', label: 'Packing Assistant', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
