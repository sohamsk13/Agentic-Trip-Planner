'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TripPlanResponse } from '@/lib/api';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

interface Props { trip: TripPlanResponse; }

export default function BudgetBreakdown({ trip }: Props) {
  const budget = trip?.budget ?? { total: 0, currency: 'INR', breakdown: [], daily_breakdown: [] };
  const sym = budget.currency === 'INR' ? '₹' : budget.currency;

  const pieData = (budget.breakdown ?? [])
    .filter((b) => b.amount > 0)
    .map((b, i) => ({ ...b, color: COLORS[i % COLORS.length] }));

  return (
    <div className="space-y-4">

      {/* Summary */}
      {trip.summary && (
        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Trip Summary</p>
          <p className="text-gray-300 text-sm leading-relaxed">{trip.summary}</p>
        </div>
      )}

      {/* Total budget hero */}
      <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
        <p className="text-blue-200 text-xs font-medium mb-1">Total Budget</p>
        <p className="text-white text-3xl font-extrabold tracking-tight">
          {sym}{budget.total > 0 ? budget.total.toLocaleString() : '—'}
        </p>
        <p className="text-blue-300 text-xs mt-1">{budget.currency} · Estimated</p>
      </div>

      {/* Pie chart + breakdown */}
      {pieData.length > 0 && (
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Breakdown</p>
          </div>

          {/* Donut chart */}
          <div className="px-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="amount" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(v: number) => [`${sym}${v.toLocaleString()}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category list */}
          <div className="px-4 pb-4 space-y-1.5">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-700/40 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-gray-300 text-sm flex-1 truncate">{item.category}</span>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-semibold">{sym}{item.amount.toLocaleString()}</p>
                  <p className="text-gray-600 text-[11px]">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget notes (from old schema amount_range) */}
      {pieData.some((b) => b.notes) && (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Budget Ranges</p>
          <div className="space-y-2">
            {pieData.filter((b) => b.notes).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                <div>
                  <span className="text-gray-400 text-xs font-medium">{item.category}: </span>
                  <span className="text-gray-500 text-xs">{item.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accommodation */}
      {(trip.accommodation ?? []).length > 0 && (
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Accommodation</p>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {trip.accommodation.map((stay, i) => (
              <div key={i} className="p-3 bg-slate-700/40 rounded-lg border border-slate-600/40 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white text-sm font-semibold leading-snug">{stay.name_or_area}</p>
                  {stay.typical_price_range && (
                    <span className="text-blue-400 text-[11px] font-medium whitespace-nowrap flex-shrink-0 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {stay.typical_price_range}
                    </span>
                  )}
                </div>
                {stay.notes && <p className="text-gray-500 text-xs leading-relaxed">{stay.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {(trip.tips_and_caveats ?? []).length > 0 && (
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tips & Caveats</p>
          </div>
          <ul className="px-4 pb-4 space-y-2">
            {trip.tips_and_caveats.map((tip, i) => (
              <li key={i} className="flex gap-2.5 text-xs text-gray-400 leading-relaxed">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uncertainty notes */}
      {trip.uncertainty_notes && (
        <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-xs font-semibold text-amber-500/80 mb-1">⚠ Uncertainty Notes</p>
          <p className="text-amber-200/60 text-xs leading-relaxed">{trip.uncertainty_notes}</p>
        </div>
      )}
    </div>
  );
}
