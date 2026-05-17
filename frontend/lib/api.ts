const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_ENDPOINT = '/api/v1/trips/plan';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityItem {
  time: string;
  title: string;
  description: string;
  category: string;
  icon: string;
}

export interface DayPlanItem {
  day_number: number;
  title: string;
  activities: ActivityItem[];
  notes: string;
}

export interface BudgetLineItem {
  category: string;
  amount: number;
  percentage: number;
  notes: string;
}

export interface BudgetSummary {
  total: number;
  currency: string;
  breakdown: BudgetLineItem[];
  daily_breakdown: { day: number; spent: number }[];
}

export interface StayOption {
  name_or_area: string;
  notes: string;
  typical_price_range: string;
}

export interface LocationItem {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  type: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TripPlanResponse {
  schema_version: string;
  trip_request: string;
  destination: string;
  summary: string;
  coordinates: Coordinates;
  accommodation: StayOption[];
  itinerary: DayPlanItem[];
  budget: BudgetSummary;
  locations: LocationItem[];
  tips_and_caveats: string[];
  sources_from_research: { title: string; url: string }[];
  uncertainty_notes: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmountRange(value: unknown): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const matches = String(value).replace(/[₹,]/g, '').match(/\d+(\.\d+)?/g);
  if (!matches) return 0;
  if (matches.length === 1) return Number(matches[0]) || 0;
  return ((Number(matches[0]) || 0) + (Number(matches[matches.length - 1]) || 0)) / 2;
}

function guessIcon(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('hotel') || t.includes('check-in') || t.includes('accommodation') || t.includes('resort') || t.includes('stay')) return 'hotel';
  if (t.includes('beach') || t.includes('sea') || t.includes('swim') || t.includes('dolphin') || t.includes('snorkel') || t.includes('lagoon')) return 'beach';
  if (t.includes('food') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast') || t.includes('eat') || t.includes('cuisine') || t.includes('shack') || t.includes('restaurant') || t.includes('cafe')) return 'food';
  if (t.includes('sunset') || t.includes('sunrise')) return 'sunset';
  if (t.includes('flight') || t.includes('train') || t.includes('transfer') || t.includes('airport') || t.includes('depart') || t.includes('arrive') || t.includes('bus') || t.includes('taxi')) return 'transport';
  return 'activity';
}

function extractDestination(source: Record<string, unknown>): string {
  if (typeof source.destination === 'string' && source.destination.trim()) {
    return source.destination.trim();
  }
  const text = String(source.trip_request || source.summary || '');
  // Try to find a capitalized place name
  const match = text.match(/\b(in|to|at|visit)\s+([A-Z][a-zA-Z\s]{2,20}?)(?:\s+with|\s+for|\s*,|\s*\.|\s*$)/i);
  if (match) return match[2].trim();
  const cap = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
  return cap ? cap[1] : text.slice(0, 30) || 'Your Trip';
}

// ─── Normalizer (handles both old and new backend schema) ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeTripPlanResponse(raw: unknown): TripPlanResponse {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid trip data');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = raw as Record<string, any>;

  // coordinates
  let coordinates: Coordinates = { lat: 0, lng: 0 };
  if (Array.isArray(s.coordinates) && s.coordinates.length >= 2) {
    coordinates = { lat: Number(s.coordinates[0]) || 0, lng: Number(s.coordinates[1]) || 0 };
  } else if (s.coordinates && typeof s.coordinates === 'object') {
    coordinates = {
      lat: Number(s.coordinates.lat ?? s.coordinates.latitude ?? 0),
      lng: Number(s.coordinates.lng ?? s.coordinates.longitude ?? 0),
    };
  }

  // budget — old schema: array of {category, amount_range, notes}
  //          new schema: {total, currency, breakdown[], daily_breakdown[]}
  let budget: BudgetSummary = { total: 0, currency: 'INR', breakdown: [], daily_breakdown: [] };
  if (Array.isArray(s.budget)) {
    const breakdown: BudgetLineItem[] = s.budget.map((item: Record<string, unknown>, i: number) => {
      const amount = parseAmountRange(item.amount_range ?? item.amount);
      return {
        category: String(item.category || `Item ${i + 1}`),
        amount,
        percentage: 0,
        notes: String(item.notes || item.amount_range || ''),
      };
    });
    const total = breakdown.reduce((sum, b) => sum + b.amount, 0);
    breakdown.forEach((b) => { b.percentage = total > 0 ? Math.round((b.amount / total) * 100) : 0; });
    budget = { total, currency: 'INR', breakdown, daily_breakdown: [] };
  } else if (s.budget && typeof s.budget === 'object') {
    const breakdown: BudgetLineItem[] = Array.isArray(s.budget.breakdown)
      ? s.budget.breakdown.map((item: Record<string, unknown>) => ({
          category: String(item.category || ''),
          amount: Number(item.amount) || parseAmountRange(item.amount_range),
          percentage: Number(item.percentage) || 0,
          notes: String(item.notes || ''),
        }))
      : [];
    const total = Number(s.budget.total) || breakdown.reduce((sum, b) => sum + b.amount, 0);
    // back-fill percentages if missing
    if (total > 0 && breakdown.every((b) => b.percentage === 0)) {
      breakdown.forEach((b) => { b.percentage = Math.round((b.amount / total) * 100); });
    }
    budget = {
      total,
      currency: String(s.budget.currency || 'INR'),
      breakdown,
      daily_breakdown: Array.isArray(s.budget.daily_breakdown)
        ? s.budget.daily_breakdown.map((d: Record<string, unknown>) => ({
            day: Number(d.day) || 0,
            spent: Number(d.spent ?? d.spend) || 0,
          }))
        : [],
    };
  }

  // itinerary
  const itinerary: DayPlanItem[] = Array.isArray(s.itinerary)
    ? s.itinerary.map((day: Record<string, unknown>, i: number) => ({
        day_number: Number(day.day_number ?? day.day ?? i + 1),
        title: String(day.title || `Day ${i + 1}`),
        notes: String(day.notes || day.description || ''),
        activities: Array.isArray(day.activities)
          ? day.activities.map((a: unknown, ai: number) => {
              if (typeof a === 'string') {
                return { time: '', title: a, description: '', category: 'activity', icon: guessIcon(a) };
              }
              const act = (a ?? {}) as Record<string, unknown>;
              const title = String(act.title || `Activity ${ai + 1}`);
              return {
                time: String(act.time || ''),
                title,
                description: String(act.description || ''),
                category: String(act.category || 'activity'),
                icon: String(act.icon || guessIcon(title)),
              };
            })
          : [],
      }))
    : [];

  // locations
  const locations: LocationItem[] = Array.isArray(s.locations)
    ? s.locations.map((l: Record<string, unknown>, i: number) => ({
        id: String(l.id || `loc_${i}`),
        name: String(l.name || ''),
        description: String(l.description || ''),
        lat: Number(l.lat ?? l.latitude ?? 0),
        lng: Number(l.lng ?? l.longitude ?? 0),
        type: String(l.type || 'activity'),
      }))
    : [];

  return {
    schema_version: String(s.schema_version || '1.0'),
    trip_request: String(s.trip_request || ''),
    destination: extractDestination(s),
    summary: String(s.summary || ''),
    coordinates,
    accommodation: Array.isArray(s.accommodation)
      ? s.accommodation.map((a: Record<string, unknown>) => ({
          name_or_area: String(a.name_or_area || a.name || ''),
          notes: String(a.notes || ''),
          typical_price_range: String(a.typical_price_range || ''),
        }))
      : [],
    itinerary,
    budget,
    locations,
    tips_and_caveats: Array.isArray(s.tips_and_caveats)
      ? s.tips_and_caveats.map(String)
      : Array.isArray(s.tips) ? s.tips.map(String) : [],
    sources_from_research: Array.isArray(s.sources_from_research)
      ? s.sources_from_research.map((r: Record<string, unknown>) => ({
          title: String(r.title || ''),
          url: String(r.url || ''),
        }))
      : [],
    uncertainty_notes: String(s.uncertainty_notes || ''),
  };
}

// ─── API call ─────────────────────────────────────────────────────────────────

export async function generateTripPlan(prompt: string): Promise<TripPlanResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_request: prompt }),
    });
  } catch {
    throw new Error('Could not connect to the server. Please check if the backend is running on port 8000.');
  }

  if (!response.ok) {
    let detail = `Server error: ${response.status}`;
    try {
      const err = await response.json();
      if (typeof err.detail === 'string') detail = err.detail;
      else if (Array.isArray(err.detail)) detail = err.detail.map((e: { msg: string }) => e.msg).join(', ');
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return normalizeTripPlanResponse(await response.json());
}
