'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MoreHorizontal } from 'lucide-react';
import { DayPlanItem } from '@/lib/api';

interface ItineraryTimelineProps {
  itinerary: DayPlanItem[];
  selectedDayIndex?: number;
  onDayChange?: (index: number) => void;
}

const iconEmojis: Record<string, string> = {
  hotel: '🏨',
  beach: '🏖️',
  food: '🍽️',
  activity: '🎯',
  sunset: '🌅',
  transport: '✈️',
};

const iconColors: Record<string, string> = {
  hotel: 'bg-blue-500/20 text-blue-400',
  beach: 'bg-cyan-500/20 text-cyan-400',
  food: 'bg-orange-500/20 text-orange-400',
  sunset: 'bg-red-500/20 text-red-400',
  transport: 'bg-green-500/20 text-green-400',
  activity: 'bg-purple-500/20 text-purple-400',
};

export default function ItineraryTimeline({
  itinerary,
  selectedDayIndex = 0,
  onDayChange,
}: ItineraryTimelineProps) {
  const selectedDay = itinerary[selectedDayIndex];

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No itinerary available
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day selector tabs */}
      <div className="flex gap-2 p-4 border-b border-slate-700 overflow-x-auto flex-shrink-0">
        {itinerary.map((day, idx) => (
          <Button
            key={day.day_number ?? idx}
            onClick={() => onDayChange?.(idx)}
            variant={idx === selectedDayIndex ? 'default' : 'outline'}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0 ${
              idx === selectedDayIndex
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Day {day.day_number}: {day.title || `Day ${day.day_number}`}
          </Button>
        ))}
      </div>

      {/* Timeline content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedDay && (
          <div className="space-y-4">
            {/* Day notes */}
            {selectedDay.notes && (
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">{selectedDay.notes}</p>
              </div>
            )}

            {/* Activities */}
            {selectedDay.activities.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No activities for this day</p>
            ) : (
              selectedDay.activities.map((activity, idx) => {
                const isLast = idx === selectedDay.activities.length - 1;
                const colorClass = iconColors[activity.icon] ?? iconColors.activity;

                return (
                  <div key={`${activity.title}-${idx}`} className="flex gap-4 relative">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg relative z-10 ${colorClass}`}>
                        {iconEmojis[activity.icon] ?? '📍'}
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-12 bg-gradient-to-b from-slate-600 to-transparent mt-2" />
                      )}
                    </div>

                    {/* Activity card */}
                    <div className="flex-1 pt-1.5">
                      <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-semibold text-white">{activity.time || '—'}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white -mr-2">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                          <h3 className="text-base font-bold text-white mb-1">{activity.title}</h3>
                          {activity.description && (
                            <p className="text-sm text-gray-400">{activity.description}</p>
                          )}
                          {activity.category && (
                            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-slate-700 text-gray-400 rounded-full capitalize">
                              {activity.category}
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })
            )}

            {/* End of day */}
            <div className="flex justify-center pt-2">
              <div className="px-4 py-2 bg-slate-800 rounded-full text-xs text-gray-400 border border-slate-700">
                End of Day {selectedDay.day_number}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
