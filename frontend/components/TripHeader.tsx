'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  Settings,
  Bell,
  User,
  MoreHorizontal,
} from 'lucide-react';

interface TripHeaderProps {
  destination: string;
  mode: string;
  onModeChange: (mode: string) => void;
}

const modes = [
  { id: 'chill', label: 'Chill Mode', icon: '😎' },
  { id: 'party', label: 'Party Mode', icon: '🎉' },
  { id: 'budget', label: 'Budget Mode', icon: '💰' },
  { id: 'explore', label: 'Explore Mode', icon: '🗺️' },
];

export default function TripHeader({
  destination,
  mode,
  onModeChange,
}: TripHeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        {/* Title and destination */}
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-xl">🌴</span>
          <div>
            <h1 className="text-2xl font-bold text-white">Your {destination} Trip</h1>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex items-center gap-2">
        {modes.map((m) => (
          <Button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            variant={mode === m.id ? 'default' : 'outline'}
            className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${
              mode === m.id
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="mr-2">{m.icon}</span>
            {m.label}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
