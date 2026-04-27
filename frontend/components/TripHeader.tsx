'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';

interface TripHeaderProps {
  destination: string;
  mode: string;
  onModeChange: (mode: string) => void;
}

const modes = [
  { id: 'chill', label: 'Chill', icon: '😎' },
  { id: 'party', label: 'Party', icon: '🎉' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'explore', label: 'Explore', icon: '🗺️' },
];

export default function TripHeader({ destination, mode, onModeChange }: TripHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `Check out my AI-planned trip to ${destination}! 🌍`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Trip to ${destination}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* user cancelled */ }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-blue-400 text-xl flex-shrink-0">🌴</span>
          <h1 className="text-xl font-bold text-white truncate">
            {destination} Trip
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-gray-400 hover:text-white flex-shrink-0 gap-1.5"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          <span className="text-xs hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {modes.map((m) => (
          <Button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            variant={mode === m.id ? 'default' : 'outline'}
            size="sm"
            className={`whitespace-nowrap text-xs font-semibold flex-shrink-0 ${
              mode === m.id
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="mr-1">{m.icon}</span>
            {m.label}
          </Button>
        ))}
      </div>
    </header>
  );
}
