'use client';

import { useState, useEffect } from 'react';
import { TripPlanResponse } from '@/lib/api';

interface TripHistoryItem {
  id: string;
  data: TripPlanResponse;
  createdAt: Date;
  mode: string;
}

const STORAGE_KEY = 'tripPlurge_history';
const MAX_TRIPS = 10;

export function useTripHistory() {
  const [trips, setTrips] = useState<TripHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load trips from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setTrips(parsed);
        }
      } catch (error) {
        console.error('Error loading trip history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Save trip to history
  const addTrip = (tripData: TripPlanResponse, mode: string) => {
    try {
      const newTrip: TripHistoryItem = {
        id: Date.now().toString(),
        data: tripData,
        createdAt: new Date(),
        mode,
      };

      const updated = [newTrip, ...trips].slice(0, MAX_TRIPS);
      setTrips(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return newTrip.id;
    } catch (error) {
      console.error('Error saving trip to history:', error);
      return null;
    }
  };

  // Delete trip from history
  const deleteTrip = (id: string) => {
    try {
      const updated = trips.filter((trip) => trip.id !== id);
      setTrips(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  // Clear all history
  const clearHistory = () => {
    try {
      setTrips([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // Get trip by ID
  const getTrip = (id: string) => {
    return trips.find((trip) => trip.id === id);
  };

  return {
    trips,
    isLoading,
    addTrip,
    deleteTrip,
    clearHistory,
    getTrip,
  };
}
