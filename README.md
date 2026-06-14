<div align="center">

# ✈️ Agentic Trip Planner

### AI-Powered Trip Planner — Full Stack

**Describe your dream trip. Get a complete itinerary, interactive map, and budget breakdown — in seconds.**

[![Python](https://img.shields.io/badge/Python-3.10%E2%80%933.13-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![crewAI](https://img.shields.io/badge/crewAI-1.9.3-FF4B4B?style=flat)](https://crewai.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)](LICENSE)

</div>

---

## What is Agentic Trip Planner?

Agentic Trip Planner is a full-stack travel planning application that uses a **multi-agent AI pipeline** (powered by [crewAI](https://crewai.com) and Google Gemini) to generate complete, structured trip plans from a single natural-language prompt.

Demo : https://www.youtube.com/watch?v=Yl0o8kwsgtw 

<img width="1907" height="906" alt="image" src="https://github.com/user-attachments/assets/6e50c59a-cccf-4630-bd94-0641aa09bd17" />


Type _"5 days in Goa with beach and nightlife, ₹20,000 budget"_ and get back:

- 📅 A detailed **day-by-day itinerary** with timed activities
- 🗺️ An **interactive map** with real lat/lng coordinates for every location
- 💰 A **full budget breakdown** with category percentages and daily spend
- 🏨 **Accommodation suggestions** with price ranges
- 💡 **Local tips, caveats**, and uncertainty notes

---

## Demo Flow

```
User Prompt
    │
    ▼
Next.js Frontend  ──POST /api/v1/trips/plan──▶  FastAPI Backend
    │                                                │
    │  (Planning Animation plays)                    ▼
    │                                         CrewAI Pipeline
    │                                         ┌─────────────┐
    │                                         │  Researcher  │  LLM knowledge only
    │                                         │    Agent     │  (no web search)
    │                                         └──────┬──────┘
    │                                                │
    │                                         ┌──────▼──────┐
    │                                         │   Writer     │  Structures the plan
    │                                         │    Agent     │  into readable sections
    │                                         └──────┬──────┘
    │                                                │
    │                                         ┌──────▼──────┐
    │                                         │  Formatter   │  Outputs strict JSON
    │                                         │    Agent     │  per schema
    │                                         └──────┬──────┘
    │                                                │
    │◀──────────── Validated TripPlanPayload ────────┘
    │
    ▼
Trip Result Page
  ├── Itinerary Timeline
  ├── Interactive Leaflet Map
  ├── Budget Donut Chart + Bar Chart
  ├── Accommodation Options
  └── AI Trip Assistant (chat)
```

---

## Features

| Feature | Details |
|---|---|
| 🤖 **3-Agent AI Pipeline** | Researcher → Writer → JSON Formatter running sequentially via crewAI |
| 🗺️ **Interactive Map** | Leaflet.js with real coordinates, circle markers per location type |
| 💰 **Budget Breakdown** | Donut chart + bar chart via Recharts, auto-calculated from AI output |
| 📅 **Day-by-day Timeline** | Activity cards with icons, times, descriptions, and category tags |
| 🎬 **Planning Animation** | Full-screen animated overlay with 6 sequential steps, floating particles, and rotating travel facts while AI generates |
| 🏨 **Accommodation Panel** | 2–3 area suggestions with typical price ranges |
| 💬 **AI Trip Assistant** | Chat sidebar for follow-up questions (wired for future LLM endpoint) |
| 📱 **Fully Responsive** | Mobile bottom sheet with map/budget toggle, desktop 3-column layout |
| 🕐 **Trip History** | Saves up to 8 past trips in localStorage — click to reload any trip |
| 🔒 **Schema Validation** | Pydantic v2 validates all AI output before sending to frontend |
| ⚡ **Async Backend** | `asyncio.wait_for` wraps the blocking crewAI call with configurable timeout |

---

## Tech Stack

### Backend
| Technology | Version | Role |
|---|---|---|
| Python | 3.10–3.13 | Runtime |
| [crewAI](https://crewai.com) | 1.9.3 | Multi-agent orchestration |
| [FastAPI](https://fastapi.tiangolo.com) | 0.115 | REST API |
| [Uvicorn](https://www.uvicorn.org) | 0.30+ | ASGI server |
| [Pydantic](https://docs.pydantic.dev) | v2 | Schema validation |
| Google Gemini 2.5 Flash | — | LLM (via crewAI) |
| [uv](https://docs.astral.sh/uv/) | — | Package & project manager |

### Frontend
| Technology | Version | Role |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2 | React framework (App Router) |
| [React](https://react.dev) | 19 | UI library |
| [TypeScript](https://typescriptlang.org) | 5.7 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4.0 | Styling |
| [Recharts](https://recharts.org) | 2.15 | Budget charts |
| [Leaflet.js](https://leafletjs.com) | 1.9.4 | Interactive map |
| [Lucide React](https://lucide.dev) | 0.564 | Icons |
| [Radix UI](https://radix-ui.com) | various | Accessible UI primitives |

---

## Project Structure

```
trip_planner/
├── src/
│   └── trip_planner/
│       ├── agents.py          # 3 crewAI agents (researcher, writer, formatter)
│       ├── tasks.py           # Sequential task definitions with JSON spec
│       ├── crew_service.py    # Assembles and runs the crew
│       ├── schemas.py         # Pydantic models + LLM prompt JSON spec
│       ├── json_parse.py      # Extracts JSON from raw LLM output
│       ├── api.py             # FastAPI app with /api/v1/trips/plan endpoint
│       ├── config.py          # LLM configuration (model, API key, temperature)
│       └── main.py            # CLI entry point
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Home page (prompt form, history, hero)
│   │   ├── trip/page.tsx      # Trip result page (3-column layout)
│   │   ├── layout.tsx         # Root layout with Leaflet CSS
│   │   └── globals.css        # Global styles, dark theme, animations
│   ├── components/
│   │   ├── PlanningAnimation.tsx   # Full-screen loading animation
│   │   ├── ItineraryTimeline.tsx   # Day-by-day activity timeline
│   │   ├── TripMap.tsx             # Map wrapper (SSR-safe dynamic import)
│   │   ├── LeafletMap.tsx          # Actual Leaflet map (client-only)
│   │   ├── BudgetBreakdown.tsx     # Charts + accommodation + tips
│   │   ├── TripHeader.tsx          # Destination header + mode selector
│   │   ├── TripAssistant.tsx       # Chat sidebar
│   │   └── LoadingStates.tsx       # Skeleton, error, empty components
│   ├── lib/
│   │   ├── api.ts             # Fetch + normalizeTripPlanResponse (handles both schemas)
│   │   └── types.ts           # Shared TypeScript interfaces
│   └── hooks/
│       └── useTripHistory.ts  # localStorage trip history hook
│
├── pyproject.toml             # Python project config + script entry points
├── .env                       # Environment variables (see setup)
└── README.md
```

---

## Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| Python | ≥ 3.10, < 3.14 |
| Node.js | ≥ 18 |
| [uv](https://docs.astral.sh/uv/) | latest |
| Google Gemini API key | [Get one free](https://aistudio.google.com/app/apikey) |

---

### 1 — Clone & set up environment

```bash
git clone https://github.com/sohamsk13/Agentic-Trip-Planner.git
cd Agentic-trip-Planner
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
CREWAI_LLM_MODEL=gemini-2.5-flash
CREWAI_TEMPERATURE=0.7
ALLOWED_ORIGINS=http://localhost:3000
PORT=8000
```

> **Get your free Gemini API key** at [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

### 2 — Start the backend

```bash
# Install Python dependencies
pip install uv        # if not already installed
uv sync

# Start the FastAPI server (runs on http://localhost:8000)
uv run trip_api
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### 3 — Start the frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Next.js dev server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

### Both servers running?

Go to `http://localhost:3000`, type a trip prompt, and click **Generate My Trip Plan**.

---

## Environment Variables

### Backend (`.env` in project root)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ | — | Your Google Gemini API key |
| `CREWAI_LLM_MODEL` | ❌ | `gemini-2.5-flash` | Gemini model ID |
| `CREWAI_TEMPERATURE` | ❌ | `0.7` | LLM temperature (0.0–1.0) |
| `CREW_TIMEOUT_SECONDS` | ❌ | `300` | Max seconds before 504 timeout |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:3000` | Comma-separated CORS origins |
| `PORT` | ❌ | `8000` | Backend server port |
| `RELOAD` | ❌ | `true` | Uvicorn hot-reload |

### Frontend (`.env.local` in `frontend/`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:8000` | Backend base URL |

---

## API Reference

### `GET /health`

Returns `{"status": "ok"}` — use for uptime checks.

---

### `POST /api/v1/trips/plan`

Runs the full 3-agent crewAI pipeline and returns a validated trip plan.

**Request body:**
```json
{
  "trip_request": "5 days in Goa with beach and nightlife, ₹20,000 budget"
}
```

**Response schema:**
```json
{
  "schema_version": "1.0",
  "trip_request": "string",
  "destination": "Goa, India",
  "summary": "string",
  "coordinates": { "lat": 15.2993, "lng": 74.1240 },
  "accommodation": [
    { "name_or_area": "string", "notes": "string", "typical_price_range": "string" }
  ],
  "itinerary": [
    {
      "day_number": 1,
      "title": "string",
      "activities": [
        { "time": "9:00 AM", "title": "string", "description": "string", "category": "string", "icon": "beach" }
      ],
      "notes": "string"
    }
  ],
  "budget": {
    "total": 20000,
    "currency": "INR",
    "breakdown": [{ "category": "string", "amount": 5000, "percentage": 25, "notes": "string" }],
    "daily_breakdown": [{ "day": 1, "spent": 4000 }]
  },
  "locations": [
    { "id": "loc_1", "name": "string", "description": "string", "lat": 15.55, "lng": 73.76, "type": "beach" }
  ],
  "tips_and_caveats": ["string"],
  "sources_from_research": [{ "title": "General knowledge", "url": "" }],
  "uncertainty_notes": "string"
}
```

**Error responses:**

| Status | Meaning |
|---|---|
| `422` | AI output couldn't be parsed or failed Pydantic validation |
| `500` | crewAI pipeline raised an unexpected exception |
| `504` | Pipeline exceeded `CREW_TIMEOUT_SECONDS` |

---

## The AI Pipeline

TripPlurge uses **three sequential crewAI agents**, each with a strict role:

```
┌──────────────────────────────────────────────────────────────────┐
│  Agent 1 — Trip Researcher                                        │
│  Goal: Draft compact travel notes from LLM training knowledge    │
│  Output: Bullet notes covering transport, stays, budget bands,   │
│          itinerary sketch — marked where uncertain               │
└──────────────────────────┬───────────────────────────────────────┘
                           │ context passed to ▼
┌──────────────────────────▼───────────────────────────────────────┐
│  Agent 2 — Trip Plan Writer                                       │
│  Goal: Turn research notes into a polished, structured document  │
│  Output: Readable markdown-style plan with sections:            │
│          Summary / Accommodation / Itinerary / Budget / Tips     │
└──────────────────────────┬───────────────────────────────────────┘
                           │ context passed to ▼
┌──────────────────────────▼───────────────────────────────────────┐
│  Agent 3 — JSON Formatter                                         │
│  Goal: Serialize the plan into ONE strict JSON object            │
│  Output: TripPlanPayload JSON — validated by Pydantic v2        │
└──────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- All agents use LLM knowledge only — no web search, no live data fetching
- The formatter is given the exact JSON schema and field rules in its task prompt
- Pydantic validation at the API layer catches any schema drift before it reaches the frontend
- The frontend normalizer (`normalizeTripPlanResponse`) gracefully handles both old and new schema shapes

---

## Frontend Architecture

### Planning Animation

While the AI pipeline runs (30–90 seconds), a full-screen animated overlay plays:

- 6 sequential steps: **Researching → Mapping → Crafting plan → Calculating budget → Scouting stays → Finishing touches**
- Each step has a gradient icon circle with pulse rings, animated step progress dots, and a progress bar
- Floating travel emoji particles (✈️ 🏖️ 🏔️ etc.) rise from the bottom
- Rotating travel facts fade in/out every 4 seconds
- The user's prompt is shown so they know what's being planned

### Trip Result Page — 3-Column Layout

```
┌──────────┬──────────────────────────┬──────────────┐
│   AI     │                          │  🗺️ Map  /   │
│ Assistant│   Itinerary Timeline     │  💰 Budget   │
│  Chat    │   (day tabs + activities)│  (toggle)    │
│  (lg+)   │                          │  (lg+)       │
└──────────┴──────────────────────────┴──────────────┘
       ↕ Mobile: bottom sheet with Map / Budget tabs
```

### Data Flow

```
sessionStorage['currentTrip']  ←  raw API JSON
        │
        ▼
normalizeTripPlanResponse()     ←  handles any schema shape
        │
        ▼
TripPlanResponse (typed)
        │
        ├──▶ ItineraryTimeline
        ├──▶ TripMap + LeafletMap
        ├──▶ BudgetBreakdown
        └──▶ TripAssistant
```

---

## CLI Commands

```bash
# Run the full trip planner in the terminal (prompts for input)
uv run trip_planner

# Same as above
uv run run_crew

# Start the FastAPI server
uv run trip_api

# Smoke test (no LLM call)
uv run test
```

---

## Development Tips

**Change the Gemini model:**  
Edit `CREWAI_LLM_MODEL` in `.env`. Supported models: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-flash`.  
If you get a 404, check [Google's model list](https://ai.google.dev/gemini-api/docs/models/gemini).

**Adjust AI creativity:**  
Set `CREWAI_TEMPERATURE=0.3` for more consistent output, `0.9` for more creative plans.

**Increase timeout for slower models:**  
```env
CREW_TIMEOUT_SECONDS=600
```

**Point frontend to a remote backend:**  
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

**API docs (Swagger UI):**  
`http://localhost:8000/docs`

---

## Common Issues

**`GEMINI_API_KEY not set` error**  
→ Make sure your `.env` is in the project root (same folder as `pyproject.toml`), not inside `src/`.

**`Could not connect to server` on frontend**  
→ Ensure the backend is running on port 8000: `uv run trip_api`

**Map shows no locations**  
→ The AI sometimes omits coordinates. This is expected — the fallback list view shows location names instead. Try a more specific prompt.

**`ModuleNotFoundError: trip_planner`**  
→ Run `uv sync` first to install the package in editable mode.

**Frontend map CSS not loading**  
→ Hard-refresh the browser (`Ctrl+Shift+R`). The Leaflet CSS is loaded via `<head>` in `layout.tsx`.

---

## Roadmap

- [ ] Real-time streaming response (SSE) so itinerary builds progressively
- [ ] Wire Trip Assistant chat to a real LLM endpoint
- [ ] Export trip as PDF
- [ ] Google Maps / Mapbox alternative map provider
- [ ] Multi-city / multi-leg trip support
- [ ] User accounts and cloud trip storage
- [ ] Collaborative trip planning (share & edit)
- [ ] Flight and hotel price integrations (live data)

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using [crewAI](https://crewai.com), [FastAPI](https://fastapi.tiangolo.com), and [Next.js](https://nextjs.org)

</div>
