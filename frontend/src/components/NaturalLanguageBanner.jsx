import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function NaturalLanguageBanner({ summary, persona }) {
  if (!summary) return null;

  const colorMap = {
    FARMER: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
    TOURIST: 'bg-amber-50/90 border-amber-200 text-amber-950',
    STUDENT: 'bg-indigo-50/90 border-indigo-200 text-indigo-950',
    PARENT: 'bg-rose-50/90 border-rose-200 text-rose-950',
  };

  const badgeColor = {
    FARMER: 'bg-emerald-200/80 text-emerald-900',
    TOURIST: 'bg-amber-200/80 text-amber-900',
    STUDENT: 'bg-indigo-200/80 text-indigo-900',
    PARENT: 'bg-rose-200/80 text-rose-900',
  };

  const themeClass = colorMap[persona] || colorMap.STUDENT;
  const badgeClass = badgeColor[persona] || badgeColor.STUDENT;

  return (
    <div className={`p-4 rounded-2xl border shadow-sm mb-5 flex items-start gap-3 transition-colors ${themeClass}`}>
      <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
        <Sparkles className="w-5 h-5 text-sky-600" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold tracking-wide uppercase">
            AI Persona Weather Advisory
          </span>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {persona}
          </span>
        </div>
        <p className="text-sm font-medium leading-relaxed">
          {summary}
        </p>
      </div>
    </div>
  );
}
