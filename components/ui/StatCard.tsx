import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  accentClass?: string;
}

export default function StatCard({ title, value, icon, subtitle, accentClass = 'text-slate-900' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
          <h3 className={`text-3xl font-light tracking-tight ${accentClass}`}>{value}</h3>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100/50">
            {icon}
          </div>
        )}
      </div>
      {subtitle && (
        <div className="flex items-center text-sm font-medium text-slate-400">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
