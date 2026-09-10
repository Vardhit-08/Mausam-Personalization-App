import React from 'react';
import { Sprout, Compass, GraduationCap, Users } from 'lucide-react';

const PERSONAS_CONFIG = [
  {
    id: 'FARMER',
    name: 'Farmer',
    icon: Sprout,
    desc: 'Soil moisture, irrigation & crop alerts',
    activeBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    selectedBg: 'bg-emerald-600 text-white',
  },
  {
    id: 'TOURIST',
    name: 'Tourist',
    icon: Compass,
    desc: 'Sightseeing comfort & travel rain advice',
    activeBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    selectedBg: 'bg-amber-600 text-white',
  },
  {
    id: 'STUDENT',
    name: 'Student',
    icon: GraduationCap,
    desc: 'Campus commute, rain gear & study ease',
    activeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    selectedBg: 'bg-indigo-600 text-white',
  },
  {
    id: 'PARENT',
    name: 'Parent',
    icon: Users,
    desc: 'Child outdoor safety & school bus transit',
    activeBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    selectedBg: 'bg-rose-600 text-white',
  },
];

export default function PersonaTabs({ activePersona, onSelectPersona }) {
  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-5">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Switch Persona Feed
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          Tailors scoring & advisory cards
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PERSONAS_CONFIG.map((p) => {
          const Icon = p.icon;
          const isSelected = activePersona === p.id;

          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${p.selectedBg} border-transparent shadow-md scale-[1.02]`
                  : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/70 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-xs'}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {isSelected && (
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-white/25 text-white">
                    Active
                  </span>
                )}
              </div>
              <span className="font-bold text-sm tracking-tight">{p.name}</span>
              <span className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                {p.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
