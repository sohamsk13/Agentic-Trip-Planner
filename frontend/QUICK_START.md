# TripPlurge - Quick Start Guide

## 30-Second Setup

### 1. Install Dependencies (1 minute)
```bash
pnpm install
```

### 2. Start Backend (On separate terminal/server)
```bash
# Your backend should be running on http://localhost:3001
# Endpoint: POST /api/v1/trips/plan
```

### 3. Start Frontend (1 minute)
```bash
pnpm dev
```

### 4. Open Browser
```
http://localhost:3000
```

## Ready to Go!

You're now running TripPlurge locally. Here's what to do:

### Test the App

1. **Go to Home Page**
   - You should see the TripPlurge landing page
   - Beautiful dark theme with blue accents

2. **Enter Trip Prompt**
   ```
   Example: "5 days in Goa with beach vibes and nightlife. Budget 20,000 rupees"
   ```

3. **Select Travel Mode**
   - Chill Mode (relaxed)
   - Party Mode (nightlife)
   - Budget Mode (cost-effective)
   - Explore Mode (adventure)

4. **Click "Generate Trip"**
   - App connects to your backend
   - Shows loading screen
   - Redirects to trip view with results

5. **Explore Results**
   - View day-by-day itinerary
   - Check interactive map
   - See budget breakdown
   - Chat with AI assistant
   - Access recent trips

## File Locations

Important files you might need to modify:

```
Config:
└─ lib/api.ts              (Change API endpoint here)

Pages:
├─ app/page.tsx            (Home page)
└─ app/trip/page.tsx       (Trip view page)

Components:
├─ components/TripHeader.tsx
├─ components/ItineraryTimeline.tsx
├─ components/TripMap.tsx
├─ components/BudgetBreakdown.tsx
└─ components/TripAssistant.tsx

Styling:
├─ app/globals.css         (Global styles & theme)
└─ app/layout.tsx          (Root layout)

Hooks:
└─ hooks/useTripHistory.ts (Trip history management)
```

## Troubleshooting

### "Could not connect to the server"
**Problem**: Backend is not running
**Solution**: 
1. Start your backend on `http://localhost:3001`
2. Verify endpoint is `POST /api/v1/trips/plan`
3. Refresh the page

### "Invalid trip data received"
**Problem**: Backend response format is wrong
**Solution**:
1. Check response includes: `destination`, `itinerary`, `budget`, `locations`
2. Compare with API spec in SETUP.md
3. Verify all required fields are present

### Map not showing
**Problem**: Leaflet map failed to load
**Solution**:
1. Check Leaflet CSS is loaded in layout.tsx
2. Verify coordinates are valid [lat, lng]
3. Check console for errors

### Trip history not saving
**Problem**: localStorage might be disabled
**Solution**:
1. Check browser allows localStorage
2. Clear browser cache
3. Try private/incognito window

## API Response Format

Your backend must return JSON like this:

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
      "description": "Arrive and relax",
      "activities": [
        {
          "time": "2:00 PM",
          "title": "Arrive at Hotel",
          "description": "Check in",
          "category": "transport",
          "icon": "hotel"
        }
      ]
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
      "description": "Popular spot",
      "lat": 15.5394,
      "lng": 73.7597,
      "type": "beach",
      "distance": "10 min drive"
    }
  ],
  "tips": ["Carry sunscreen"]
}
```

## Commands

```bash
# Development
pnpm dev              # Start dev server on :3000

# Build
pnpm build            # Build for production

# Production
pnpm start            # Start production server

# Linting
pnpm lint             # Check code quality
```

## Testing Prompts

Try these to test your setup:

1. **Beach Trip**
   ```
   "5 days in Goa with beach activities and relaxation. Budget: 20,000 rupees"
   ```

2. **Mountain Adventure**
   ```
   "7 days trekking in Himalayas. Budget: 30,000 rupees. Adventure-focused"
   ```

3. **Budget Trip**
   ```
   "3 days in Jaipur with budget backpacking. Max 10,000 rupees"
   ```

4. **Luxury Getaway**
   ```
   "Weekend in Kerala backwaters with luxury stays. Budget: 50,000 rupees"
   ```

## Key Features

- ✅ AI-powered trip generation
- ✅ Beautiful dark theme UI
- ✅ Interactive maps with Leaflet
- ✅ Budget breakdown charts
- ✅ Day-by-day itinerary timeline
- ✅ Trip history tracking
- ✅ AI assistant chatbot
- ✅ Responsive mobile design
- ✅ Error handling & loading states
- ✅ Trip mode customization

## Next Steps

1. **Test basic functionality** with sample prompts
2. **Verify map displays** correctly
3. **Check budget charts** render
4. **Test trip history** persistence
5. **Try responsive design** on mobile
6. **Review and customize** styling if needed
7. **Deploy to production** when ready

## Customization

### Change Colors
Edit `app/globals.css` for color theme

### Change API Endpoint
Edit `lib/api.ts` line 1: `const API_BASE_URL = '...'`

### Modify Prompts
Edit `app/page.tsx` example prompts section

### Adjust Layouts
Components use Tailwind CSS - edit className props

## Documentation

- **SETUP.md** - Detailed setup and configuration
- **PROJECT_SUMMARY.md** - Architecture and features
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment checklist
- **This file** - Quick start guide

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review SETUP.md for detailed documentation
3. Check console for error messages
4. Verify backend is running correctly
5. Review API response format matches spec

## Success!

You should now see:
- ✅ Home page with trip form
- ✅ Trip generation working
- ✅ Itinerary view with map
- ✅ Budget breakdown chart
- ✅ Trip history saved locally
- ✅ Responsive mobile design

**Enjoy planning amazing trips with AI!**

---

**Version**: 1.0.0
**Last Updated**: April 23, 2026
**Status**: Production Ready
