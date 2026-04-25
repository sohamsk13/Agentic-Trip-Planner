'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TripHeader from '@/components/TripHeader';
import ItineraryTimeline from '@/components/ItineraryTimeline';
import TripMap from '@/components/TripMap';
import BudgetBreakdown from '@/components/BudgetBreakdown';
import TripAssistant from '@/components/TripAssistant';
import { TripLoadingSkeleton, ErrorAlert, EmptyState } from '@/components/LoadingStates';
import { TripPlanResponse } from '@/lib/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Parse a rupee string like "₹3,750 - ₹6,250" → midpoint number */
function parseAmountRange(s: unknown): number {
  if (typeof s === 'number') return s;
  if (!s) return 0;
  const nums = String(s).replace(/[₹,]/g, '').match(/\d+(\.\d+)?/g);
  if (!nums) return 0;
  if (nums.length === 1) return parseFloat(nums[0]);
  return (parseFloat(nums[0]) + parseFloat(nums[nums.length - 1])) / 2;
}

/** Extract destination name from trip_request string */
function extractDestination(raw: Record<string, unknown>): string {
  if (raw.destination && typeof raw.destination === 'string' && raw.destination.trim()) {
    return raw.destination.trim();
  }
  // Try to pull from trip_request e.g. "5-day Goa trip..." → "Goa"
  const req = String(raw.trip_request || raw.summary || '');
  const match = req.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
  return match ? match[1] : req.slice(0, 40) || 'Your Trip';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTripData(raw: any): TripPlanResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid trip data');
  }

  // ── coordinates ──────────────────────────────────────────────────────────
  let coordinates = { lat: 0, lng: 0 };
  if (Array.isArray(raw.coordinates) && raw.coordinates.length >= 2) {
    coordinates = { lat: Number(raw.coordinates[0]) || 0, lng: Number(raw.coordinates[1]) || 0 };
  } else if (raw.coordinates && typeof raw.coordinates === 'object') {
    coordinates = {
      lat: Number(raw.coordinates.lat ?? raw.coordinates.latitude ?? 0),
      lng: Number(raw.coordinates.lng ?? raw.coordinates.longitude ?? 0),
    };
  }

  // ── budget ────────────────────────────────────────────────────────────────
  let budget: TripPlanResponse['budget'] = { total: 0, currency: 'INR', breakdown: [], daily_breakdown: [] };

  if (Array.isArray(raw.budget)) {
    // OLD schema: [{category, amount_range, notes}, ...]
    const breakdown = raw.budget.map((b: Record<string, unknown>, i: number) => {
      const amount = parseAmountRange(b.amount_range ?? b.amount);
      return {
        category: String(b.category || `Item ${i + 1}`),
        amount,
        percentage: 0,
        notes: String(b.notes || b.amount_range || ''),
      };
    });
    const total = breakdown.reduce((s: number, b: { amount: number }) => s + b.amount, 0);
    // Back-fill percentages
    breakdown.forEach((b: { percentage: number; amount: number }) => {
      b.percentage = total > 0 ? Math.round((b.amount / total) * 100) : 0;
    });
    budget = { total, currency: 'INR', breakdown, daily_breakdown: [] };

  } else if (raw.budget && typeof raw.budget === 'object') {
    // NEW schema: {total, currency, breakdown[], daily_breakdown[]}
    const breakdown = Array.isArray(raw.budget.breakdown)
      ? raw.budget.breakdown.map((b: Record<string, unknown>) => ({
          category: String(b.category || ''),
          amount: Number(b.amount) || parseAmountRange(b.amount_range),
          percentage: Number(b.percentage) || 0,
          notes: String(b.notes || ''),
        }))
      : [];
    budget = {
      total: Number(raw.budget.total) || breakdown.reduce((s: number, b: { amount: number }) => s + b.amount, 0),
      currency: String(raw.budget.currency || 'INR'),
      breakdown,
      daily_breakdown: Array.isArray(raw.budget.daily_breakdown)
        ? raw.budget.daily_breakdown.map((d: Record<string, unknown>) => ({
            day: Number(d.day) || 0,
            spent: Number(d.spent ?? d.spend) || 0,
          }))
        : [],
    };
  }

  // ── itinerary ─────────────────────────────────────────────────────────────
  const itinerary: TripPlanResponse['itinerary'] = Array.isArray(raw.itinerary)
    ? raw.itinerary.map((d: Record<string, unknown>, i: number) => ({
        day_number: Number(d.day_number ?? d.day ?? i + 1),
        title: String(d.title || `Day ${i + 1}`),
        notes: String(d.notes || d.description || ''),
        activities: Array.isArray(d.activities)
          ? d.activities.map((a: unknown, ai: number) => {
              if (typeof a === 'string') {
                // OLD schema: activities are plain strings
                return {
                  time: '',
                  title: a,
                  description: '',
                  category: 'activity',
                  icon: guessIcon(a),
                };
              }
              const act = (a ?? {}) as Record<string, unknown>;
              return {
                time: String(act.time || ''),
                title: String(act.title || `Activity ${ai + 1}`),
                description: String(act.description || ''),
                category: String(act.category || 'activity'),
                icon: String(act.icon || guessIcon(String(act.title || ''))),
              };
            })
          : [],
      }))
    : [];

  // ── locations ─────────────────────────────────────────────────────────────
  const locations: TripPlanResponse['locations'] = Array.isArray(raw.locations)
    ? raw.locations.map((l: Record<string, unknown>, i: number) => ({
        id: String(l.id || `loc_${i}`),
        name: String(l.name || ''),
        description: String(l.description || ''),
        lat: Number(l.lat ?? l.latitude ?? 0),
        lng: Number(l.lng ?? l.longitude ?? 0),
        type: String(l.type || 'activity'),
      }))
    : [];

  return {
    schema_version: String(raw.schema_version || '1.0'),
    trip_request: String(raw.trip_request || ''),
    destination: extractDestination(raw),
    summary: String(raw.summary || ''),
    coordinates,
    accommodation: Array.isArray(raw.accommodation)
      ? raw.accommodation.map((a: Record<string, unknown>) => ({
          name_or_area: String(a.name_or_area || a.name || ''),
          notes: String(a.notes || ''),
          typical_price_range: String(a.typical_price_range || ''),
        }))
      : [],
    itinerary,
    budget,
    locations,
    tips_and_caveats: Array.isArray(raw.tips_and_caveats)
      ? raw.tips_and_caveats.map(String)
      : Array.isArray(raw.tips)
        ? raw.tips.map(String)
        : [],
    sources_from_research: Array.isArray(raw.sources_from_research)
      ? raw.sources_from_research
      : [],
    uncertainty_notes: String(raw.uncertainty_notes || ''),
  };
}

/** Guess an icon type from activity text */
function guessIcon(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('hotel') || t.includes('check') || t.includes('accommodation')) return 'hotel';
  if (t.includes('beach') || t.includes('sea') || t.includes('swim') || t.includes('dolphin')) return 'beach';
  if (t.includes('food') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast') || t.includes('eat') || t.includes('cuisine') || t.includes('shack')) return 'food';
  if (t.includes('sunset') || t.includes('sunrise')) return 'sunset';
  if (t.includes('flight') || t.includes('train') || t.includes('transfer') || t.includes('airport') || t.includes('depart') || t.includes('arrive')) return 'transport';
  return 'activity';
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
        setTripData(normalizeTripData(raw));
        if (storedMode) setTripMode(storedMode);
      } catch (e) {
        console.error('normalizeTripData failed:', e);
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
      {/* Back bar */}
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

      {/* Header */}
      <TripHeader
        destination={tripData.destination || tripData.trip_request || 'Your Trip'}
        mode={tripMode}
        onModeChange={setTripMode}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-3 p-3">
        {/* Left Sidebar */}
        <div className="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
          <TripAssistant />
        </div>

        {/* Center - Itinerary */}
        <div className="flex-1 flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700 min-w-0">
          <ItineraryTimeline
            itinerary={tripData.itinerary}
            selectedDayIndex={selectedDayIndex}
            onDayChange={setSelectedDayIndex}
          />
        </div>

        {/* Right Panel - Desktop */}
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

      {/* Mobile Bottom */}
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
