# AI Trip Planner - TripPlurge Setup Guide

## Overview
TripPlurge is a modern AI-powered trip planning application built with React + Vite. It allows users to input trip prompts and receive AI-generated itineraries with detailed plans, budgets, and maps.

## Architecture

### Frontend (Next.js 16 + React 19)
- **Home Page** (`/app/page.tsx`) - Landing page with trip prompt input
- **Trip View** (`/app/trip/page.tsx`) - Dynamic itinerary display
- **Components**:
  - `TripHeader` - Top navigation and mode selector
  - `ItineraryTimeline` - Day-by-day activities timeline
  - `TripMap` - Interactive map with Leaflet
  - `BudgetBreakdown` - Budget charts with Recharts
  - `TripAssistant` - AI assistant chatbot
  - `LoadingStates` - Loading skeletons and error states

### Backend Integration
- **API Endpoint**: `http://localhost:3001/api/v1/trips/plan`
- **Method**: POST
- **Request Body**: `{ "prompt": "user's trip description" }`
- **Response**: Full itinerary JSON with destination, itinerary, budget, and locations

### Data Persistence
- **Trip History**: Stored in localStorage (max 10 recent trips)
- **Session Data**: Current trip stored in sessionStorage
- **Hook**: `useTripHistory()` - Manage trip history

## Installation

### Prerequisites
- Node.js 18+ and pnpm (or npm/yarn)
- Backend server running on `http://localhost:3001`

### Steps

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure API Endpoint** (Optional)
   - Default: `http://localhost:3001`
   - Edit: `/lib/api.ts` if your backend is on a different URL

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

4. **Access the Application**
   - Open http://localhost:3000 in your browser
   - Ensure your backend is running on http://localhost:3001

## Feature Walkthrough

### 1. Home Page
- **Trip Prompt Input**: Users describe their ideal trip
- **Mode Selection**: Choose between Chill, Party, Budget, and Explore modes
- **Example Prompts**: Quick-start templates for common trips
- **Recent Trips**: Access previously generated trips from history

### 2. Trip Generation
- Send prompt to backend API
- Real-time loading state with skeleton UI
- Error handling with user-friendly messages
- Automatic redirection to trip view

### 3. Trip View
- **Itinerary Timeline**: Day-by-day activities with times and descriptions
- **Interactive Map**: Leaflet map showing trip locations with markers
- **Budget Breakdown**: Donut chart showing expense distribution
- **Daily Spending**: Bar chart for daily budget tracking
- **Trip Assistant**: AI chatbot for trip modifications

### 4. Responsive Design
- **Desktop (1024px+)**: Full 3-column layout (sidebar, itinerary, map/budget)
- **Tablet (768px-1023px)**: Collapsible sidebar with toggle buttons
- **Mobile (<768px)**: Single column with bottom sheet for budget summary

## API Request/Response Format

### Request
```json
{
  "prompt": "5 days in Goa with beach activities and nightlife. Budget: 20,000 rupees. I prefer chill vibes."
}
```

### Response
```json
{
  "destination": "Goa, India",
  "startDate": "2024-05-01",
  "endDate": "2024-05-05",
  "coordinates": [15.4909, 73.8278],
  "accommodation": {
    "name": "Beach Resort",
    "address": "Calangute Beach",
    "type": "resort"
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & Beach Bliss",
      "description": "Arrive and relax at the beach",
      "activities": [
        {
          "time": "2:00 PM",
          "title": "Arrive at Hotel",
          "description": "Check in and settle",
          "category": "transport",
          "icon": "hotel"
        }
      ],
      "image": "url-to-image"
    }
  ],
  "budget": {
    "total": 20000,
    "currency": "INR",
    "breakdown": [
      {
        "category": "Accommodation",
        "amount": 8000,
        "percentage": 40
      }
    ],
    "dailyBreakdown": [
      {
        "day": 1,
        "spent": 5000
      }
    ]
  },
  "locations": [
    {
      "id": "calangute",
      "name": "Calangute Beach",
      "description": "Popular sun spot",
      "lat": 15.5394,
      "lng": 73.7597,
      "type": "beach",
      "distance": "10 min drive"
    }
  ],
  "tips": ["Carry sunscreen", "Best time: Nov-Feb"]
}
```

## Environment Variables
No environment variables required. API endpoint is hardcoded to `http://localhost:3001`.

## Troubleshooting

### Backend Connection Error
- **Error**: "Could not connect to the server. Please check if the backend is running."
- **Fix**: Ensure backend is running on `http://localhost:3001`
- **Check**: Try accessing http://localhost:3001/api/v1/trips/plan in Postman

### Invalid Trip Data
- **Error**: "Invalid trip data received from server"
- **Fix**: Verify backend returns complete trip data with all required fields
- **Check**: Review response structure against the format above

### Session Data Lost
- **Issue**: Trip data disappears when refreshing
- **Note**: This is expected - trip data is stored in sessionStorage and cleared on refresh
- **Solution**: Implement persistent storage (database) if needed

### Map Not Displaying
- **Check**: Leaflet CSS is loaded in layout.tsx
- **Issue**: Might occur on mobile with inline maps
- **Fallback**: App shows location text if map fails to render

## Development Notes

### Component Reusability
- Components are modular and accept dynamic data
- No hardcoded Goa data - fully API-driven
- Easy to extend with additional features

### State Management
- Home page: `useState` for form state
- Trip page: `useState` for UI state
- History: Custom `useTripHistory` hook with localStorage

### Styling
- Tailwind CSS v4 with slate-950 dark theme
- 5-color palette: slate-950, slate-900, blue-600, orange-500, green-500
- Responsive design with mobile-first approach

## Future Enhancements

1. **User Authentication**: Save trips to user accounts
2. **Trip Modifications**: Allow editing of existing itineraries
3. **Real-time Collaboration**: Share trips with friends
4. **Payment Integration**: Book hotels and activities
5. **Weather Integration**: Show weather for each day
6. **Review System**: User ratings for locations and activities

## Support
For issues or questions, check the backend API documentation and ensure the request/response format matches the specification above.
