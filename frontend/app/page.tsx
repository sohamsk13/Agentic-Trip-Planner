'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateTripPlan } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { useTripHistory } from '@/hooks/useTripHistory';

const MODES = [
  { id: 'chill', label: 'Chill', icon: '😎', description: 'Relaxed & leisurely' },
  { id: 'party', label: 'Party', icon: '🎉', description: 'Nightlife focused' },
  { id: 'budget', label: 'Budget', icon: '💰', description: 'Cost effective' },
  { id: 'explore', label: 'Explore', icon: '🗺️', description: 'Adventure packed' },
];

const EXAMPLES = [
  '5 days in Goa with beach and nightlife, ₹20,000 budget',
  '3 days in Kerala backwaters, relaxation focused',
  'Week in Himalayas with trekking and adventure',
];

export default function Home() {
  const router = useRouter();
  const { trips, addTrip } = useTripHistory();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('chill');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleGenerateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a destination or trip description');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const tripData = await generateTripPlan(prompt);
      if (!tripData) throw new Error('Invalid trip data received from server');
      addTrip(tripData, mode);
      sessionStorage.setItem('currentTrip', JSON.stringify(tripData));
      sessionStorage.setItem('tripMode', mode);
      router.push('/trip');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate trip plan');
      console.error('Error generating trip:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 sm:px-6 py-4 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              TP
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">TripPlurge</h1>
              <p className="text-gray-500 text-xs">AI-Powered Trip Planning</p>
            </div>
          </div>
          {trips.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              History ({trips.length})
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-2xl">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Powered by AI
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Plan your perfect trip{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                in seconds
              </span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto">
              Describe your dream trip and our AI will craft a complete itinerary, budget breakdown, and map.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl shadow-black/40">
            <form onSubmit={handleGenerateTrip} className="space-y-5">
              {/* Prompt */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-semibold text-white mb-2">
                  Where do you want to go?
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 5 days in Goa with beach vibes and some nightlife. Budget around ₹20,000. Relaxing days with good food."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors text-sm"
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Travel style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      disabled={isLoading}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        mode === m.id
                          ? 'border-blue-500 bg-blue-500/10 shadow-sm shadow-blue-500/20'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="text-xl block mb-1">{m.icon}</span>
                      <p className="text-white font-semibold text-xs">{m.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-tight">{m.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3 flex items-start gap-2">
                  <span className="text-red-400 text-sm mt-0.5">⚠</span>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-blue-600/40 disabled:to-blue-700/40 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 text-sm"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Generating your trip...
                  </>
                ) : (
                  <>
                    <span>✈️</span>
                    Generate Trip Plan
                  </>
                )}
              </button>
            </form>

            {/* Examples */}
            <div className="mt-6 pt-6 border-t border-slate-700/60">
              <p className="text-gray-500 text-xs font-medium mb-3 uppercase tracking-wide">Try an example</p>
              <div className="space-y-2">
                {EXAMPLES.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(example)}
                    disabled={isLoading}
                    className="w-full text-left px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-600"
                  >
                    <span className="text-gray-500 mr-2">→</span>{example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Trips */}
          {trips.length > 0 && showHistory && (
            <div className="mt-8">
              <h3 className="text-white font-semibold text-base mb-4">Recent Trips</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trips.slice(0, 4).map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => {
                      sessionStorage.setItem('currentTrip', JSON.stringify(trip.data));
                      sessionStorage.setItem('tripMode', trip.mode);
                      router.push('/trip');
                    }}
                    className="text-left p-4 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors truncate flex-1 mr-2">
                        {trip.data.destination || trip.data.trip_request || 'Trip'}
                      </h4>
                      <span className="text-gray-600 text-xs flex-shrink-0">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 capitalize">{trip.mode} mode</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-400">
                        {trip.data.budget?.currency === 'INR' ? '₹' : (trip.data.budget?.currency ?? '')}
                        {(trip.data.budget?.total ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats footer */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Instant Planning', value: 'Seconds' },
              { label: 'AI Powered', value: 'Smart' },
              { label: 'Fully Custom', value: 'Your Way' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <p className="text-white font-bold text-base">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
