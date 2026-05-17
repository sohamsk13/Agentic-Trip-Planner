'use client';

import React, { useEffect, useRef } from 'react';
import { LocationItem } from '@/lib/api';

interface Props {
  center: [number, number];
  locations: LocationItem[];
  getMarkerColor: (type: string) => string;
}

export default function LeafletMap({ center, locations, getMarkerColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet');

    // Fix default icon paths broken by webpack
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Center marker
    L.marker(center)
      .bindPopup('<strong style="color:#e2e8f0">Trip Center</strong>')
      .addTo(map);

    // Location markers
    locations.forEach((loc) => {
      L.circleMarker([loc.lat, loc.lng], {
        radius: 9,
        fillColor: getMarkerColor(loc.type),
        color: '#0f172a',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .bindPopup(
          `<strong style="color:#e2e8f0">${loc.name}</strong>` +
          (loc.description ? `<br/><span style="color:#94a3b8;font-size:11px">${loc.description}</span>` : '')
        )
        .addTo(map);
    });

    // Fit bounds
    const allPoints = [
      L.latLng(center[0], center[1]),
      ...locations.map((l) => L.latLng(l.lat, l.lng)),
    ];
    try {
      if (allPoints.length > 1) {
        map.fitBounds(L.latLngBounds(allPoints).pad(0.15));
      } else {
        map.setView(center, 12);
      }
    } catch {
      map.setView(center, 12);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '200px' }} />;
}
