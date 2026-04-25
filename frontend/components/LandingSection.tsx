'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function LandingSection() {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center rounded-lg overflow-hidden"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop")',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-xl">
          Plan your trip in seconds with AI
        </h1>
        <p className="text-lg text-gray-200 mb-8 max-w-md">
          Discover amazing destinations and create personalized itineraries
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg">
          Get Started
        </Button>
      </div>
    </div>
  );
}
