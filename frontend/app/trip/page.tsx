'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TripHeader from '@/components/TripHeader';
import ItineraryTimeline from '@/components/ItineraryTimeline';
import TripMap from '@/components/TripMap';
import BudgetBreakdown from '@/components/BudgetBreakdown';
import TripAssistant from '@/components/TripAssistant';
import { TripLoadingSkeleton, ErrorAlert, EmptyState } from '@/components/LoadingStates';
import { normalizeTripPlanResponse, TripPlanResponse } from '@/lib/api';

export default function TripPage() {
  const router = useRouter();
  const [tripData, setTripData] = useState<TripPlanResponse | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tripMode, setTripMode] = useState<string>('chill');
  const [showMapOrBudget, setShowMapOrBudget] = useState<'map' | 'budget'>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedTrip = sessionStorage.getItem('currentTrip');
    const storedMode = sessionStorage.getItem('tripMode');

    if (storedTrip) {
      try {
        const raw = JSON.parse(storedTrip);
        setTripData(normalizeTripPlanResponse(raw));
        if (storedMode) setTripMode(storedMode);
      } catch (e) {
        console.error('normalizeTripPlanResponse failed:', e);
        setError('Failed to load trip data. Please try again.');
      }
    } else {
      setError('No trip data found. Redirecting to home...');
      setTimeout(() => router.push('/'), 2000);
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) return <TripLoadingSkeleton />;

  if (error && !tripData) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center px-4">
        <ErrorAlert message={error} onRetry={() => router.push('/')} />
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <EmptyState title="No Trip Found" description="Please generate a new trip plan to get started" />
      </div>
    );
  }

  const { budget } = tripData;
  const currencySymbol = budget.currency === 'INR' ? '₹' : budget.currency;

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 bg-slate-950 flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New Trip
        </button>
        {tripData.destination && (
          <span className="text-gray-600 text-sm truncate">/ {tripData.destination}</span>
        )}
      </div>

      <TripHeader
        destination={tripData.destination || tripData.trip_request || 'Your Trip'}
        mode={tripMode}
        onModeChange={setTripMode}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-3 p-3">
        <div className="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
          <TripAssistant />
        </div>

        <div className="flex-1 flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 min-w-0">
          <ItineraryTimeline
            itinerary={tripData.itinerary}
            selectedDayIndex={selectedDayIndex}
            onDayChange={setSelectedDayIndex}
          />
        </div>

        <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 gap-3 flex-shrink-0">
          <div className="flex gap-2 flex-shrink-0">
            {(['map', 'budget'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setShowMapOrBudget(tab)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors capitalize ${
                  showMapOrBudget === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {showMapOrBudget === 'map' ? (
            <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 min-h-0">
              <TripMap locations={tripData.locations} center={tripData.coordinates} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-900 rounded-lg border border-slate-700 p-4 min-h-0">
              <BudgetBreakdown trip={tripData} />
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden border-t border-slate-700 bg-slate-900 flex-shrink-0">
        <div className="flex border-b border-slate-700">
          {(['map', 'budget'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setShowMapOrBudget(tab)}
              className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${
                showMapOrBudget === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {showMapOrBudget === 'map' ? (
          <div className="h-64">
            <TripMap locations={tripData.locations} center={tripData.coordinates} />
          </div>
        ) : (
          <div className="p-4 max-h-64 overflow-y-auto">
            {budget.breakdown.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                {budget.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-2">
                    <p className="text-gray-400 text-xs truncate">{item.category}</p>
                    <p className="text-white font-semibold">{currencySymbol}{item.amount.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No budget breakdown available</p>
            )}
            <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/50">
              <p className="text-gray-300 text-xs">Total Budget</p>
              <p className="text-blue-400 font-bold text-lg">
                {currencySymbol}{budget.total.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
