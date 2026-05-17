'use client';

import { useState, useEffect } from 'react';
import { normalizeTripPlanResponse, TripPlanResponse } from '@/lib/api';

export interface TripHistoryItem {
  id: string;
  data: TripPlanResponse;
  createdAt: string;
  mode: string;
}

interface TripSummary {
  id: string;
  destination: string;
  budgetTotal: number;
  budgetCurrency: string;
  createdAt: string;
  mode: string;
}

const SUMMARY_KEY = 'tripPlurge_summaries';
const DATA_PREFIX = 'tripPlurge_data_';
const MAX_TRIPS = 8;

function readSummaries(): TripSummary[] {
  try { return JSON.parse(localStorage.getItem(SUMMARY_KEY) ?? '[]'); } catch { return []; }
}
function writeSummaries(s: TripSummary[]) {
  try { localStorage.setItem(SUMMARY_KEY, JSON.stringify(s)); } catch { /* quota */ }
}
function readTripData(id: string): TripPlanResponse | null {
  try {
    const raw = localStorage.getItem(`${DATA_PREFIX}${id}`);
    return raw ? normalizeTripPlanResponse(JSON.parse(raw)) : null;
  } catch { return null; }
}
function writeTripData(id: string, data: TripPlanResponse) {
  try { localStorage.setItem(`${DATA_PREFIX}${id}`, JSON.stringify(data)); } catch { /* quota */ }
}

export function useTripHistory() {
  const [summaries, setSummaries] = useState<TripSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSummaries(readSummaries());
    setIsLoading(false);
  }, []);

  const addTrip = (tripData: TripPlanResponse, mode: string): string => {
    const id = Date.now().toString();
    writeTripData(id, tripData);
    const summary: TripSummary = {
      id,
      destination: tripData.destination || tripData.trip_request?.slice(0, 40) || 'Trip',
      budgetTotal: tripData.budget?.total ?? 0,
      budgetCurrency: tripData.budget?.currency ?? 'INR',
      createdAt: new Date().toISOString(),
      mode,
    };
    const updated = [summary, ...summaries].slice(0, MAX_TRIPS);
    setSummaries(updated);
    writeSummaries(updated);
    return id;
  };

  const deleteTrip = (id: string) => {
    try { localStorage.removeItem(`${DATA_PREFIX}${id}`); } catch { /* ignore */ }
    const updated = summaries.filter((s) => s.id !== id);
    setSummaries(updated);
    writeSummaries(updated);
  };

  const clearHistory = () => {
    summaries.forEach((s) => { try { localStorage.removeItem(`${DATA_PREFIX}${s.id}`); } catch { /* ignore */ } });
    setSummaries([]);
    try { localStorage.removeItem(SUMMARY_KEY); } catch { /* ignore */ }
  };

  // Build TripHistoryItem list — data loaded from localStorage
  const trips: TripHistoryItem[] = summaries.map((s) => ({
    id: s.id,
    data: readTripData(s.id) ?? ({
      schema_version: '1.0',
      trip_request: '',
      destination: s.destination,
      summary: '',
      coordinates: { lat: 0, lng: 0 },
      accommodation: [],
      itinerary: [],
      budget: { total: s.budgetTotal, currency: s.budgetCurrency, breakdown: [], daily_breakdown: [] },
      locations: [],
      tips_and_caveats: [],
      sources_from_research: [],
      uncertainty_notes: '',
    } as TripPlanResponse),
    createdAt: s.createdAt,
    mode: s.mode,
  }));

  return { trips, isLoading, addTrip, deleteTrip, clearHistory };
}
