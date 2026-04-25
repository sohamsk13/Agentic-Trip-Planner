# Frontend Plan — Distinctive UX (matches `TripPlanPayload`)

Backend contract: `POST /api/v1/trips/plan` returns `TripPlanPayload` (`schema_version`, `trip_request`, `summary`, `accommodation`, `itinerary`, `budget`, `tips_and_caveats`, `sources_from_research`, `uncertainty_notes`). **No separate `flights` array** in the current API—if you need flights later, extend the backend schema first, then the UI.

Because the backend is **LLM-only** (no web search), the frontend should **look impressive** while **never pretending** that data is live from the web.

---

## Design direction

- **Aesthetic**: “Editorial travel magazine” — strong typography, warm neutrals, one accent color, generous whitespace (not generic purple-AI gradients).
- **Motion**: Subtle staggered reveals for itinerary days; skeleton loaders during the API call, not a bare spinner only.
- **Dark mode**: System preference + toggle; persist in `localStorage`.

---

## Unique, attractive features

### 1. Trust ribbon (always visible)

A slim bar: *“Plans are generated from AI knowledge—not live prices or availability. Verify before booking.”* Link to `uncertainty_notes` on success.

### 2. Prompt studio (guided input)

Instead of one textarea only:

- **Destination** (text)
- **Dates / length** (date range or “N days”)
- **Budget vibe** (slider: shoestring → comfort → luxury)
- **Interests** (chips: food, nature, nightlife, family)

Merge into one `trip_request` string for the API, or add a future `POST` body with structured fields once the backend supports it.

### 3. Trip “hero” card

After response: large card with **summary**, trip title derived from user input, and **uncertainty_notes** in a highlighted “Before you book” panel (builds honesty *and* polish).

### 4. Timeline itinerary (signature view)

Vertical timeline with **day_number** pills, **title**, **activities** as checkable sub-items, **notes** in collapsible detail. Export as print-friendly CSS.

### 5. Budget “stacked bar” visualization

Turn `budget[]` into a horizontal stacked or segmented bar using **category** + **amount_range** (parsed lightly as text if needed). Shows structure even without exact numbers.

### 6. Stay cards

Grid of cards from `accommodation`: **name_or_area**, **notes**, **typical_price_range**—card hover elevation + map placeholder (optional static map image via free tile provider later; out of scope for MVP).

### 7. Sources honesty mode

For LLM-only: show `sources_from_research` as *“General knowledge (no live web search)”* when URLs are empty—never fake links.

### 8. Tips as dismissible chips

`tips_and_caveats[]` rendered as removable chips so the page feels interactive.

### 9. Sessions and compare (local-first)

- **History**: last N plans in `indexedDB` or `localStorage` (title + date + summary snippet).
- **Compare**: pick two saved plans side-by-side (markdown diff or section diff).

### 10. Delight moments

- **Confetti** only on successful validation (subtle).
- **Share**: “Copy Markdown summary” built from payload (no backend required).

---

## Technical stack (suggested)

- **Vite + React + TypeScript** (fast, standard).
- **Tailwind CSS** or **CSS modules** for a custom look without template sameness.
- **TanStack Query** for `planTrip` mutation (retries, cache key by request string).
- **Zod** to validate API JSON at runtime (catch schema drift).

---

## API client (aligned with current schema)

```ts
export type TripPlanPayload = {
  schema_version: string;
  trip_request: string;
  summary: string;
  accommodation: Array<{
    name_or_area: string;
    notes: string;
    typical_price_range: string;
  }>;
  itinerary: Array<{
    day_number: number;
    title: string;
    activities: string[];
    notes: string;
  }>;
  budget: Array<{
    category: string;
    amount_range: string;
    notes: string;
  }>;
  tips_and_caveats: string[];
  sources_from_research: Array<{ title: string; url: string }>;
  uncertainty_notes: string;
};

export async function planTrip(tripRequest: string): Promise<TripPlanPayload> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
  const response = await fetch(`${base}/api/v1/trips/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trip_request: tripRequest }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Trip planning failed (${response.status}): ${text}`);
  }
  return response.json();
}
```

---

## Phases

| Phase | Goal |
|--------|------|
| **MVP** | Prompt UI, loading skeleton, hero + timeline + budget strip, error states, env-based API URL |
| **Plus** | Local history, Markdown export, compare, dark mode |
| **Pro** | Auth, saved trips on server, PDF export, optional real search re-enabled behind a feature flag |

---

## Integration checklist

- Backend on port **8000**, frontend dev server with **CORS** allowing your origin (tighten in production).
- E2E: happy path + 422 when the model returns bad JSON (show friendly “try again” message).
- Display **uncertainty_notes** on every successful plan.

This plan stays honest about LLM limits while delivering a UI that feels crafted and memorable.
