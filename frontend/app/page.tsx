'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateTripPlan } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { useTripHistory } from '@/hooks/useTripHistory';

const MODES = [
  { id: 'chill',   label: 'Chill',   icon: '😎', desc: 'Relaxed & leisurely' },
  { id: 'party',   label: 'Party',   icon: '🎉', desc: 'Nightlife focused'   },
  { id: 'budget',  label: 'Budget',  icon: '💰', desc: 'Cost effective'      },
  { id: 'explore', label: 'Explore', icon: '🗺️', desc: 'Adventure packed'    },
];

const EXAMPLES = [
  '5 days in Goa with beach and nightlife, ₹20,000 budget',
  '3 days in Kerala backwaters, relaxation focused',
  'Week in Himalayas with trekking and adventure',
  '4 days in Rajasthan exploring forts and culture',
];

export default function Home() {
  const router = useRouter();
  const { trips, addTrip } = useTripHistory();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('chill');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) { setError('Please describe your trip'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateTripPlan(prompt.trim());
      addTrip(data, mode);
      sessionStorage.setItem('currentTrip', JSON.stringify(data));
      sessionStorage.setItem('tripMode', mode);
      router.push('/trip');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate trip plan');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryTrip = (tripData: object, tripMode: string) => {
    sessionStorage.setItem('currentTrip', JSON.stringify(tripData));
    sessionStorage.setItem('tripMode', tripMode);
    router.push('/trip');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/25">
              TP
            </div>
            <div className="leading-none">
              <p className="text-white font-bold text-base">TripPlurge</p>
              <p className="text-gray-500 text-[11px]">AI-Powered Trip Planning</p>
            </div>
          </div>
          {trips.length > 0 && (
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                showHistory
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                  : 'border-slate-700 text-gray-400 hover:text-white hover:border-slate-600'
              }`}
            >
              History ({trips.length})
            </button>
          )}
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-2xl">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
              Powered by Gemini AI
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-[1.1] tracking-tight">
              Plan your perfect trip{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                in seconds
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Describe your dream trip and get a complete itinerary, budget breakdown, and interactive map — instantly.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">

              {/* Prompt textarea */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-semibold text-white mb-2">
                  Describe your trip
                </label>
                <div className="relative">
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent); }}
                    placeholder="e.g., 5 days in Goa with beach vibes and some nightlife. Budget around ₹20,000. Relaxing days with good food."
                    rows={4}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 resize-none transition-all text-sm leading-relaxed disabled:opacity-60"
                  />
                  <span className="absolute bottom-2.5 right-3 text-gray-600 text-xs pointer-events-none">
                    {prompt.length}/2000
                  </span>
                </div>
              </div>

              {/* Mode selector */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Travel style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      disabled={isLoading}
                      className={`p-3 rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        mode === m.id
                          ? 'border-blue-500 bg-blue-500/10 shadow-sm shadow-blue-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-lg block mb-1">{m.icon}</span>
                      <p className="text-white font-semibold text-xs leading-none">{m.label}</p>
                      <p className="text-gray-500 text-[11px] mt-0.5 leading-tight">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/30 rounded-xl p-3.5">
                  <span className="text-red-400 text-base leading-none mt-0.5 flex-shrink-0">⚠</span>
                  <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] disabled:from-slate-700 disabled:to-slate-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/20 disabled:shadow-none text-sm disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    <span>Generating your trip plan...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">✈️</span>
                    <span>Generate Trip Plan</span>
                    <span className="text-blue-300 text-xs font-normal hidden sm:inline ml-1">⌘↵</span>
                  </>
                )}
              </button>
            </form>

            {/* Examples */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-slate-800 pt-5">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-3">Try an example</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    disabled={isLoading}
                    className="text-left px-3.5 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-gray-400 hover:text-gray-200 rounded-lg transition-all text-xs leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-blue-500 mr-1.5 group-hover:text-blue-400">→</span>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History */}
          {trips.length > 0 && showHistory && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm">Recent Trips</h2>
                <span className="text-gray-600 text-xs">{trips.length} saved</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {trips.slice(0, 6).map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => loadHistoryTrip(trip.data, trip.mode)}
                    className="text-left p-4 bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors truncate flex-1">
                        {trip.data.destination || trip.data.trip_request?.slice(0, 35) || 'Trip'}
                      </h3>
                      <span className="text-gray-600 text-[11px] flex-shrink-0">
                        {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-gray-500 capitalize bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                        {trip.mode}
                      </span>
                      {(trip.data.budget?.total ?? 0) > 0 && (
                        <span className="text-[11px] text-green-400/80">
                          {trip.data.budget?.currency === 'INR' ? '₹' : (trip.data.budget?.currency ?? '')}
                          {(trip.data.budget?.total ?? 0).toLocaleString()}
                        </span>
                      )}
                      {trip.data.itinerary?.length > 0 && (
                        <span className="text-[11px] text-gray-600">
                          {trip.data.itinerary.length} days
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              { icon: '⚡', label: 'Instant results' },
              { icon: '🗺️', label: 'Interactive map' },
              { icon: '💰', label: 'Budget breakdown' },
              { icon: '📅', label: 'Day-by-day plan' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-full text-xs text-gray-400">
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
