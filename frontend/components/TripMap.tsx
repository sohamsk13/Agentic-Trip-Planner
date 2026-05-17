'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { LocationItem, Coordinates } from '@/lib/api';

interface TripMapProps {
  locations: LocationItem[] | null | undefined;
  center: Coordinates | null | undefined;
}

function normalizeCenter(c: unknown): [number, number] {
  if (!c) return [20.5937, 78.9629]; // India center fallback
  if (Array.isArray(c) && c.length >= 2) return [Number(c[0]) || 0, Number(c[1]) || 0];
  if (typeof c === 'object') {
    const o = c as Record<string, unknown>;
    return [Number(o.lat ?? o.latitude ?? 0), Number(o.lng ?? o.longitude ?? 0)];
  }
  return [20.5937, 78.9629];
}

const MARKER_COLORS: Record<string, string> = {
  hotel: '#3B82F6', beach: '#06B6D4', restaurant: '#F59E0B',
  food: '#F59E0B', activity: '#10B981', transport: '#8B5CF6',
};
function getMarkerColor(type: string) { return MARKER_COLORS[type] ?? '#8B5CF6'; }

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-xs">Loading map…</p>
      </div>
    </div>
  ),
});

export default function TripMap({ locations, center }: TripMapProps) {
  const safeCenter = useMemo(() => normalizeCenter(center), [center]);
  const safeLocations = useMemo(
    () => (Array.isArray(locations) ? locations : []).filter((l) => l && (l.lat !== 0 || l.lng !== 0)),
    [locations]
  );

  const hasCenter = safeCenter[0] !== 0 || safeCenter[1] !== 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm font-semibold">Trip Locations</span>
        </div>
        <span className="text-gray-600 text-xs">{safeLocations.length} places</span>
      </div>

      {/* Map or fallback */}
      <div className="flex-1 min-h-0 relative">
        {hasCenter || safeLocations.length > 0 ? (
          <LeafletMap center={safeCenter} locations={safeLocations} getMarkerColor={getMarkerColor} />
        ) : (
          <FallbackList locations={safeLocations} />
        )}
      </div>
    </div>
  );
}

function FallbackList({ locations }: { locations: LocationItem[] }) {
  if (locations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-center p-6">
        <span className="text-3xl">🗺️</span>
        <p className="text-gray-400 text-sm font-medium">No location data</p>
        <p className="text-gray-600 text-xs">The AI didn&apos;t provide coordinates for this trip.</p>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      {locations.map((loc, i) => (
        <div key={loc.id || i} className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 hover:border-slate-600 transition-colors">
          <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: getMarkerColor(loc.type) }} />
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{loc.name}</p>
            {loc.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{loc.description}</p>}
            <p className="text-gray-700 text-[11px] mt-1">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
          </div>
          <span className="text-[10px] text-gray-600 capitalize bg-slate-700 px-1.5 py-0.5 rounded flex-shrink-0">{loc.type}</span>
        </div>
      ))}
    </div>
  );
}
