'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface Props {
  destination: string;
  mode: string;
  onModeChange: (mode: string) => void;
}

const MODES = [
  { id: 'chill',   label: 'Chill',   icon: '😎' },
  { id: 'party',   label: 'Party',   icon: '🎉' },
  { id: 'budget',  label: 'Budget',  icon: '💰' },
  { id: 'explore', label: 'Explore', icon: '🗺️' },
];

export default function TripHeader({ destination, mode, onModeChange }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `Check out my AI-planned trip to ${destination}! 🌍 — Made with TripPlurge`;
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
    <header className="bg-slate-900/80 border-b border-slate-800 px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">🌴</span>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-lg leading-tight truncate">
              {destination}
            </h1>
            <p className="text-gray-500 text-xs">AI-Generated Trip Plan</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-gray-400 hover:text-white transition-all text-xs font-medium flex-shrink-0"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
            : <><Share2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Share</span></>
          }
        </button>
      </div>

      {/* Mode pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              mode === m.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-slate-800 border border-slate-700 text-gray-400 hover:text-white hover:border-slate-600'
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
