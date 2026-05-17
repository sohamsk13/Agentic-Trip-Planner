'use client';

import React from 'react';
import { Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPlanItem } from '@/lib/api';

interface Props {
  itinerary: DayPlanItem[];
  selectedDayIndex?: number;
  onDayChange?: (index: number) => void;
}

const ICON_EMOJI: Record<string, string> = {
  hotel: '🏨', beach: '🏖️', food: '🍽️',
  activity: '🎯', sunset: '🌅', transport: '✈️',
};

const ICON_STYLE: Record<string, string> = {
  hotel:     'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20',
  beach:     'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/20',
  food:      'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20',
  sunset:    'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20',
  transport: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20',
  activity:  'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/20',
};

export default function ItineraryTimeline({ itinerary, selectedDayIndex = 0, onDayChange }: Props) {
  const safeIndex = Math.max(0, Math.min(selectedDayIndex, (itinerary?.length ?? 1) - 1));
  const selectedDay = itinerary?.[safeIndex];

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-2xl">📅</div>
        <p className="text-gray-400 font-medium">No itinerary available</p>
        <p className="text-gray-600 text-sm">The AI didn&apos;t generate day-by-day plans for this trip.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ── Day tabs ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-slate-800">
        {/* Mobile: prev/next nav */}
        <div className="flex items-center gap-2 px-3 py-2 sm:hidden">
          <button
            onClick={() => onDayChange?.(Math.max(0, safeIndex - 1))}
            disabled={safeIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-white font-semibold text-sm">
              Day {selectedDay?.day_number} — {selectedDay?.title || `Day ${selectedDay?.day_number}`}
            </p>
            <p className="text-gray-500 text-xs">{safeIndex + 1} of {itinerary.length}</p>
          </div>
          <button
            onClick={() => onDayChange?.(Math.min(itinerary.length - 1, safeIndex + 1))}
            disabled={safeIndex === itinerary.length - 1}
            className="p-1.5 rounded-lg bg-slate-800 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop: scrollable tabs */}
        <div className="hidden sm:flex gap-1.5 px-4 py-3 overflow-x-auto">
          {itinerary.map((day, idx) => (
            <button
              key={day.day_number ?? idx}
              onClick={() => onDayChange?.(idx)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                idx === safeIndex
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <span className="text-[10px] opacity-70 mr-1">Day {day.day_number}</span>
              {day.title || `Day ${day.day_number}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Day content ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {selectedDay && (
          <div className="p-4 space-y-3">

            {/* Day header */}
            <div className="flex items-center gap-3 pb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                {selectedDay.day_number}
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-base leading-tight truncate">
                  {selectedDay.title || `Day ${selectedDay.day_number}`}
                </h2>
                {selectedDay.notes && (
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{selectedDay.notes}</p>
                )}
              </div>
              <div className="ml-auto flex-shrink-0 text-xs text-gray-600 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                {selectedDay.activities.length} activities
              </div>
            </div>

            {/* Activities timeline */}
            {selectedDay.activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="text-3xl mb-2">📋</span>
                <p className="text-gray-500 text-sm">No activities listed for this day</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDay.activities.map((activity, idx) => {
                  const isLast = idx === selectedDay.activities.length - 1;
                  const iconStyle = ICON_STYLE[activity.icon] ?? ICON_STYLE.activity;
                  const emoji = ICON_EMOJI[activity.icon] ?? '📍';

                  return (
                    <div key={`${activity.title}-${idx}`} className="flex gap-3">
                      {/* Timeline */}
                      <div className="flex flex-col items-center flex-shrink-0 pt-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${iconStyle}`}>
                          {emoji}
                        </div>
                        {!isLast && (
                          <div className="w-px flex-1 bg-gradient-to-b from-slate-700 to-transparent mt-1.5 min-h-[20px]" />
                        )}
                      </div>

                      {/* Card */}
                      <div className={`flex-1 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3.5 transition-all cursor-default ${isLast ? 'mb-0' : 'mb-1'}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-white font-semibold text-sm leading-snug flex-1">{activity.title}</h3>
                          {activity.time && (
                            <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{activity.time}</span>
                            </div>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-gray-400 text-xs leading-relaxed">{activity.description}</p>
                        )}
                        {activity.category && activity.category !== 'activity' && (
                          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-slate-700/80 text-gray-500 rounded-full capitalize border border-slate-600/50">
                            {activity.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* End of day */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-slate-800" />
              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                <MapPin className="w-3 h-3" />
                End of Day {selectedDay.day_number}
              </div>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
