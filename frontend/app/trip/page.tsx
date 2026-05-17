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
  const [tripMode, setTripMode] = useState('chill');
  const [activePanel, setActivePanel] = useState<'map' | 'budget'>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('currentTrip');
      const mode = sessionStorage.getItem('tripMode');
      if (!raw) {
        setError('No trip data found.');
        setTimeout(() => router.push('/'), 2000);
        setIsLoading(false);
        return;
      }
      setTripData(normalizeTripPlanResponse(JSON.parse(raw)));
      if (mode) setTripMode(mode);
    } catch (e) {
      console.error('Failed to load trip:', e);
      setError('Failed to load trip data. Please generate a new trip.');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) return <TripLoadingSkeleton />;

  if (error && !tripData) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <ErrorAlert message={error} onRetry={() => router.push('/')} />
        </div>
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

      {/* ── Top nav bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm flex-shrink-0 z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm font-medium group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New Trip
        </button>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-blue-400 text-sm">🌍</span>
          <span className="text-gray-300 text-sm font-medium truncate">
            {tripData.destination || tripData.trip_request || 'Your Trip'}
          </span>
        </div>
        {budget.total > 0 && (
          <>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-gray-500 text-xs hidden sm:inline">
              Budget: <span className="text-green-400 font-semibold">{currencySymbol}{budget.total.toLocaleString()}</span>
            </span>
          </>
        )}
      </div>

      {/* ── Trip header (destination + mode selector) ────────────────────── */}
      <TripHeader
        destination={tripData.destination || tripData.trip_request || 'Your Trip'}
        mode={tripMode}
        onModeChange={setTripMode}
      />

      {/* ── Main 3-column layout ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-2 p-2 sm:gap-3 sm:p-3">

        {/* Left — AI Assistant (desktop only) */}
        <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex-shrink-0">
          <TripAssistant />
        </aside>

        {/* Center — Itinerary */}
        <main className="flex-1 flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 min-w-0">
          <ItineraryTimeline
            itinerary={tripData.itinerary}
            selectedDayIndex={Math.min(selectedDayIndex, Math.max(0, tripData.itinerary.length - 1))}
            onDayChange={setSelectedDayIndex}
          />
        </main>

        {/* Right — Map / Budget (desktop) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 gap-2 xl:gap-3 flex-shrink-0">
          {/* Panel toggle */}
          <div className="flex bg-slate-900 rounded-xl border border-slate-800 p-1 gap-1 flex-shrink-0">
            {(['map', 'budget'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePanel(tab)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all capitalize ${
                  activePanel === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab === 'map' ? '🗺️ Map' : '💰 Budget'}
              </button>
            ))}
          </div>

          {activePanel === 'map' ? (
            <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 min-h-0">
              <TripMap locations={tripData.locations} center={tripData.coordinates} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl border border-slate-800 p-4 min-h-0">
              <BudgetBreakdown trip={tripData} />
            </div>
          )}
        </aside>
      </div>

      {/* ── Mobile bottom panel ──────────────────────────────────────────── */}
      <div className="lg:hidden flex-shrink-0 border-t border-slate-800 bg-slate-900">
        {/* Tab bar */}
        <div className="flex border-b border-slate-800">
          {(['map', 'budget'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePanel(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                activePanel === tab
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'map' ? '🗺️ Map' : '💰 Budget'}
            </button>
          ))}
        </div>

        {activePanel === 'map' ? (
          <div className="h-56">
            <TripMap locations={tripData.locations} center={tripData.coordinates} />
          </div>
        ) : (
          <div className="p-3 max-h-56 overflow-y-auto">
            {budget.breakdown.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {budget.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
                    <p className="text-gray-400 text-xs truncate mb-0.5">{item.category}</p>
                    <p className="text-white font-bold text-sm">{currencySymbol}{item.amount.toLocaleString()}</p>
                    <p className="text-gray-600 text-xs">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-3">No budget breakdown available</p>
            )}
            <div className="p-3 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl border border-blue-500/30">
              <p className="text-gray-400 text-xs mb-0.5">Total Budget</p>
              <p className="text-blue-400 font-bold text-xl">{currencySymbol}{budget.total.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
