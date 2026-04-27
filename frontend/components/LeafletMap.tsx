'use client';

import React, { useEffect, useRef } from 'react';
import { LocationItem } from '@/lib/api';

interface LeafletMapProps {
  center: [number, number];
  locations: LocationItem[];
  getMarkerColor: (type: string) => string;
}

export default function LeafletMap({ center, locations, getMarkerColor }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet');

    const map = L.map(containerRef.current).setView(center, 12);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.marker(center, { icon: defaultIcon })
      .bindPopup('<strong>Trip Center</strong>')
      .addTo(map);

    locations.forEach((loc) => {
      L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        fillColor: getMarkerColor(loc.type),
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      })
        .bindPopup(`<strong>${loc.name}</strong><br/><span style="color:#666">${loc.description}</span>`)
        .addTo(map);
    });

    if (locations.length > 0) {
      const allPoints = [
        L.latLng(center[0], center[1]),
        ...locations.map((l) => L.latLng(l.lat, l.lng)),
      ];
      try {
        map.fitBounds(L.latLngBounds(allPoints).pad(0.15));
      } catch { /* ignore */ }
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '280px' }} />;
}
