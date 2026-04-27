'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationItem, Coordinates } from '@/lib/api';

interface TripMapProps {
  locations: LocationItem[];
  center: Coordinates | null | undefined;
}

function normalizeCenter(center: unknown): [number, number] {
  if (!center) return [20.5937, 78.9629];
  if (Array.isArray(center) && center.length >= 2) return [Number(center[0]) || 0, Number(center[1]) || 0];
  if (typeof center === 'object') {
    const c = center as Record<string, unknown>;
    return [Number(c.lat ?? c.latitude ?? 0), Number(c.lng ?? c.longitude ?? 0)];
  }
  return [0, 0];
}

function getMarkerColor(type: string): string {
  const colors: Record<string, string> = {
    hotel: '#3B82F6', beach: '#06B6D4', restaurant: '#F59E0B',
    food: '#F59E0B', activity: '#10B981', transport: '#8B5CF6',
  };
  return colors[type] ?? '#8B5CF6';
}

// Dynamically import the actual map to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-800">
      <p className="text-gray-400 text-sm">Loading map...</p>
    </div>
  ),
});

export default function TripMap({ locations, center }: TripMapProps) {
  const safeCenter = useMemo(() => normalizeCenter(center), [center]);
  const safeLocations = useMemo(
    () => (Array.isArray(locations) ? locations : []).filter((l) => l.lat || l.lng),
    [locations]
  );

  const hasValidCenter = safeCenter[0] !== 0 || safeCenter[1] !== 0;

  if (!hasValidCenter && safeLocations.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 h-full">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <p className="text-gray-500 text-sm">No location data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-white text-base">Trip Locations</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden rounded-b-lg">
        <LeafletMap
          center={safeCenter}
          locations={safeLocations}
          getMarkerColor={getMarkerColor}
        />
      </CardContent>
    </Card>
  );
}
