'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  MessageSquare,
  Settings,
  ChevronDown,
  Send,
  MoreVertical,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Trip } from '@/lib/types';

interface TripSidebarProps {
  trip: Trip;
}

export default function TripSidebar({ trip }: TripSidebarProps) {
  const [messages, setMessages] = React.useState<
    { id: string; text: string; sender: 'user' | 'assistant' }[]
  >([
    {
      id: '1',
      text: 'How can I help with your Goa trip?',
      sender: 'assistant',
    },
  ]);
  const [messageInput, setMessageInput] = React.useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: messageInput,
        sender: 'user' as const,
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');

      // Simulate assistant response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "That's a great question! I can help you make the most of your trip.",
            sender: 'assistant',
          },
        ]);
      }, 800);
    }
  };

  return (
    <div className="w-full lg:w-80 bg-slate-900 border-r border-slate-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="text-white font-semibold">TripPlurge</span>
        </div>
      </div>

      {/* Trip Form */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-3">
          Plan your next trip
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Destination
            </label>
            <Input
              placeholder="Goa"
              defaultValue="Goa"
              className="bg-slate-800 border-slate-700 text-white placeholder-gray-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="May 12 - May 15"
              defaultValue="May 12 - May 15"
              className="bg-slate-800 border-slate-700 text-white placeholder-gray-500 text-sm flex-1"
            />
            <Button className="bg-slate-700 hover:bg-slate-600 text-white px-3">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700 text-sm"
            >
              Relax & Explore
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700 text-sm"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2">
            Generate Trip
          </Button>
        </div>
      </div>

      {/* Destination Cards */}
      <div className="p-4 border-b border-slate-700">
        <div className="grid grid-cols-3 gap-2">
          {trip.itinerary.slice(0, 3).map((day, idx) => (
            <div
              key={idx}
              className="h-20 rounded-lg bg-cover bg-center relative group cursor-pointer overflow-hidden"
              style={{
                backgroundImage: `url('${day.image}')`,
              }}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  Day {day.day}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Itinerary Preview */}
      <div className="flex-1 overflow-y-auto p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-white flex-1">
            {trip.itinerary[0].title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {trip.itinerary[0].activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <div className="text-xl mt-0.5">{activity.mood}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">{activity.time}</p>
                <p className="text-sm font-semibold text-white truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>

        {trip.itinerary[0].image && (
          <div className="mt-4 h-24 rounded-lg bg-cover bg-center" />
        )}
      </div>

      {/* Trip Assistant Chat */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white flex-1">
            Trip Assistant
          </h3>
          <Button variant="ghost" size="sm" className="text-gray-400">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat messages */}
        <div className="h-32 bg-slate-800 rounded-lg p-3 mb-3 overflow-y-auto space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="bg-slate-800 border-slate-700 text-white placeholder-gray-500 text-sm"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
