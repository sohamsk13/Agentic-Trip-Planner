'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { LocationItem, Coordinates } from '@/lib/api';

interface TripMapProps {
  locations: LocationItem[];
  center: Coordinates | null | undefined;
}

/** Normalize center from any shape the backend/sessionStorage might give us */
function normalizeCenter(center: unknown): { lat: number; lng: number } {
  if (!center) return { lat: 20.5937, lng: 78.9629 }; // India fallback
  if (Array.isArray(center) && center.length >= 2) {
    return { lat: Number(center[0]) || 0, lng: Number(center[1]) || 0 };
  }
  if (typeof center === 'object') {
    const c = center as Record<string, unknown>;
    const lat = Number(c.lat ?? c.latitude ?? 0);
    const lng = Number(c.lng ?? c.longitude ?? 0);
    return { lat, lng };
  }
  return { lat: 0, lng: 0 };
}

/** Normalize a location, guarding against missing lat/lng */
function normalizeLoc(loc: unknown): { id: string; name: string; description: string; lat: number; lng: number; type: string } {
  const l = (loc ?? {}) as Record<string, unknown>;
  return {
    id: String(l.id ?? ''),
    name: String(l.name ?? ''),
    description: String(l.description ?? ''),
    lat: Number(l.lat ?? l.latitude ?? 0),
    lng: Number(l.lng ?? l.longitude ?? 0),
    type: String(l.type ?? 'activity'),
  };
}

export default function TripMap({ locations, center }: TripMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLeaflet, setHasLeaflet] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasLeaflet(!!(window as Window & { L?: unknown }).L);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const safeCenter = normalizeCenter(center);
  const safeLocations = (Array.isArray(locations) ? locations : []).map(normalizeLoc);

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700 h-full">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading map...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-white">Trip Locations</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        {hasLeaflet ? (
          <MapRenderer locations={safeLocations} center={safeCenter} />
        ) : (
          <FallbackMap locations={safeLocations} center={safeCenter} />
        )}
      </CardContent>
    </Card>
  );
}

interface SafeProps {
  locations: ReturnType<typeof normalizeLoc>[];
  center: { lat: number; lng: number };
}

function MapRenderer({ locations, center }: SafeProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([center.lat, center.lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapInstanceRef.current = map;

    locations.forEach((loc) => {
      if (!loc.lat && !loc.lng) return;
      L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        fillColor: getMarkerColor(loc.type),
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup(`<div style="color:#000;font-weight:bold">${loc.name}</div><div style="color:#666">${loc.description}</div>`)
        .addTo(map);
    });

    L.marker([center.lat, center.lng], {
      icon: L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    })
      .bindPopup('Trip Center')
      .addTo(map);

    const validLocs = locations.filter((l) => l.lat || l.lng);
    if (validLocs.length > 0) {
      const group = L.featureGroup([
        ...validLocs.map((l) => L.latLng(l.lat, l.lng)),
        L.latLng(center.lat, center.lng),
      ]);
      try { map.fitBounds(group.getBounds().pad(0.1)); } catch { /* ignore */ }
    }
  }, [locations, center]);

  return <div ref={mapRef} className="w-full h-full" style={{ minHeight: '300px' }} />;
}

function FallbackMap({ locations, center }: SafeProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 p-4 flex flex-col gap-3 overflow-y-auto">
      <p className="text-gray-300 text-sm font-medium">📍 Locations</p>

      <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
          <p className="font-semibold text-white text-sm">Trip Center</p>
        </div>
        <p className="text-xs text-gray-400">
          {center.lat !== 0 || center.lng !== 0
            ? `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
            : 'Coordinates not available'}
        </p>
      </div>

      {locations.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No locations available</p>
      )}

      {locations.map((loc, idx) => (
        <div
          key={loc.id || idx}
          className="p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getMarkerColor(loc.type) }} />
            <p className="font-semibold text-white text-sm flex-1 truncate">{loc.name}</p>
            <span className="text-xs text-gray-500 capitalize flex-shrink-0">{loc.type}</span>
          </div>
          {loc.description && <p className="text-xs text-gray-400 mb-1">{loc.description}</p>}
          {(loc.lat !== 0 || loc.lng !== 0) && (
            <p className="text-xs text-gray-500">📍 {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function getMarkerColor(type: string): string {
  const colors: Record<string, string> = {
    hotel: '#3B82F6',
    beach: '#06B6D4',
    restaurant: '#F59E0B',
    food: '#F59E0B',
    activity: '#10B981',
    transport: '#8B5CF6',
  };
  return colors[type] ?? '#8B5CF6';
}
