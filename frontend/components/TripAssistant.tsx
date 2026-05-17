'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: Date;
}

const SUGGESTIONS = [
  'Make Day 2 cheaper',
  'Find hidden gems nearby',
  'Best local food spots',
  'Budget-friendly alternatives',
];

export default function TripAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hi! I can help you refine your trip. Ask me anything about your itinerary, budget, or destinations.',
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), ts: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    // Simulated response — replace with real API call when available
    await new Promise((r) => setTimeout(r, 700));
    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: 'Great question! For now, try regenerating your trip with a more specific prompt on the home page. Full AI assistant support is coming soon. 🚀',
      ts: new Date(),
    };
    setMessages((p) => [...p, reply]);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); send(input); };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-purple-500/30 flex-shrink-0">
          AI
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">Trip Assistant</p>
          <p className="text-gray-500 text-[11px] mt-0.5">Ask anything about your trip</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Online" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mr-2 mt-0.5">
                AI
              </div>
            )}
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-800 text-gray-200 border border-slate-700 rounded-bl-sm'
              }`}
            >
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-600'}`}>
                {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mr-2 mt-0.5">
              AI
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-3 py-2 border-t border-slate-800 flex-shrink-0">
          <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-wide mb-2">Suggestions</p>
          <div className="grid grid-cols-2 gap-1.5">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                className="text-left px-2.5 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 transition-all leading-tight"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 px-3 py-3 border-t border-slate-800 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your trip…"
          disabled={loading}
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-gray-600 text-white rounded-xl transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
