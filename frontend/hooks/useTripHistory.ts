'use client';

import { useState, useEffect } from 'react';
import { TripPlanResponse } from '@/lib/api';

export interface TripHistoryItem {
  id: string;
  data: TripPlanResponse;
  createdAt: string; // ISO string — safe for JSON serialization
  mode: string;
}

/** Compact summary stored in localStorage (avoids 5MB limit) */
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
  try {
    const raw = localStorage.getItem(SUMMARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSummaries(summaries: TripSummary[]) {
  try {
    localStorage.setItem(SUMMARY_KEY, JSON.stringify(summaries));
  } catch { /* quota exceeded — silently skip */ }
}

function readTripData(id: string): TripPlanResponse | null {
  try {
    const raw = sessionStorage.getItem(`${DATA_PREFIX}${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeTripData(id: string, data: TripPlanResponse) {
  try {
    sessionStorage.setItem(`${DATA_PREFIX}${id}`, JSON.stringify(data));
  } catch { /* quota exceeded */ }
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
    const summary: TripSummary = {
      id,
      destination: tripData.destination || tripData.trip_request?.slice(0, 40) || 'Trip',
      budgetTotal: tripData.budget?.total ?? 0,
      budgetCurrency: tripData.budget?.currency ?? 'INR',
      createdAt: new Date().toISOString(),
      mode,
    };
    writeTripData(id, tripData);
    const updated = [summary, ...summaries].slice(0, MAX_TRIPS);
    setSummaries(updated);
    writeSummaries(updated);
    return id;
  };

  const deleteTrip = (id: string) => {
    try { sessionStorage.removeItem(`${DATA_PREFIX}${id}`); } catch { /* ignore */ }
    const updated = summaries.filter((s) => s.id !== id);
    setSummaries(updated);
    writeSummaries(updated);
  };

  const clearHistory = () => {
    summaries.forEach((s) => {
      try { sessionStorage.removeItem(`${DATA_PREFIX}${s.id}`); } catch { /* ignore */ }
    });
    setSummaries([]);
    try { localStorage.removeItem(SUMMARY_KEY); } catch { /* ignore */ }
  };

  // Reconstruct TripHistoryItem on demand (data from sessionStorage)
  const trips: TripHistoryItem[] = summaries.map((s) => ({
    id: s.id,
    data: readTripData(s.id) ?? ({
      destination: s.destination,
      budget: { total: s.budgetTotal, currency: s.budgetCurrency, breakdown: [], daily_breakdown: [] },
    } as unknown as TripPlanResponse),
    createdAt: s.createdAt,
    mode: s.mode,
  }));

  return { trips, isLoading, addTrip, deleteTrip, clearHistory };
}
