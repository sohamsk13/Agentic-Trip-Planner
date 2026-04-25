'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TripPlanResponse } from '@/lib/api';

interface BudgetBreakdownProps {
  trip: TripPlanResponse;
}

const PIE_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function BudgetBreakdown({ trip }: BudgetBreakdownProps) {
  const budget = trip?.budget ?? { total: 0, currency: 'INR', breakdown: [], daily_breakdown: [] };

  const pieData = (budget.breakdown ?? []).map((item, idx) => ({
    ...item,
    color: PIE_COLORS[idx % PIE_COLORS.length],
  }));

  const barData = (budget.daily_breakdown ?? []).map((d) => ({
    day: `Day ${d.day}`,
    spent: d.spent,
  }));

  const currencySymbol = budget.currency === 'INR' ? '₹' : budget.currency;

  return (
    <div className="space-y-4">
      {/* Trip Summary */}
      {trip.summary && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Trip Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm leading-relaxed">{trip.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Total Budget Hero */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
        <CardContent className="pt-6 pb-5">
          <div className="text-center">
            <p className="text-blue-100 text-sm mb-1">Total Budget</p>
            <p className="text-3xl font-bold text-white">
              {currencySymbol}{budget.total.toLocaleString()}
            </p>
            <p className="text-blue-200 text-xs mt-1">{budget.currency}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pie + Legend */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base">Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-300 truncate">{item.category}</span>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold text-white">{currencySymbol}{item.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                    {/* Show original range text if available (old schema) */}
                    {item.notes && item.notes !== '' && (
                      <p className="text-xs text-gray-600 max-w-[120px] truncate" title={item.notes}>{item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Spend Bar Chart */}
      {barData.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Daily Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Spent']}
                />
                <Bar dataKey="spent" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Accommodation */}
      {(trip.accommodation ?? []).length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Accommodation Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(trip.accommodation ?? []).map((stay, idx) => (
              <div key={idx} className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{stay.name_or_area}</p>
                  <span className="text-xs text-blue-400 whitespace-nowrap">{stay.typical_price_range}</span>
                </div>
                {stay.notes && <p className="text-xs text-gray-400 mt-1">{stay.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {(trip.tips_and_caveats ?? []).length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Tips & Caveats</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(trip.tips_and_caveats ?? []).map((tip, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
