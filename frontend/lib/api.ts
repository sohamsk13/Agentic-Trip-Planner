const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_ENDPOINT = '/api/v1/trips/plan';

export interface TripPlanRequest {
  trip_request: string;
}

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

function parseAmountRange(value: unknown): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const matches = String(value).replace(/[₹,]/g, '').match(/\d+(\.\d+)?/g);
  if (!matches) return 0;
  if (matches.length === 1) return Number(matches[0]) || 0;

  return ((Number(matches[0]) || 0) + (Number(matches[matches.length - 1]) || 0)) / 2;
}

function guessIcon(text: string): string {
  const normalized = text.toLowerCase();

  if (normalized.includes('hotel') || normalized.includes('check') || normalized.includes('accommodation')) return 'hotel';
  if (normalized.includes('beach') || normalized.includes('sea') || normalized.includes('swim') || normalized.includes('dolphin')) return 'beach';
  if (normalized.includes('food') || normalized.includes('dinner') || normalized.includes('lunch') || normalized.includes('breakfast') || normalized.includes('eat') || normalized.includes('cuisine') || normalized.includes('shack')) return 'food';
  if (normalized.includes('sunset') || normalized.includes('sunrise')) return 'sunset';
  if (normalized.includes('flight') || normalized.includes('train') || normalized.includes('transfer') || normalized.includes('airport') || normalized.includes('depart') || normalized.includes('arrive')) return 'transport';

  return 'activity';
}

function extractDestination(raw: Record<string, unknown>): string {
  if (typeof raw.destination === 'string' && raw.destination.trim()) {
    return raw.destination.trim();
  }

  const requestText = String(raw.trip_request || raw.summary || '');
  const match = requestText.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
  return match ? match[1] : requestText.slice(0, 40) || 'Your Trip';
}

export function normalizeTripPlanResponse(raw: unknown): TripPlanResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid trip data received from server');
  }

  const source = raw as Record<string, any>;

  let coordinates: Coordinates = { lat: 0, lng: 0 };
  if (Array.isArray(source.coordinates) && source.coordinates.length >= 2) {
    coordinates = {
      lat: Number(source.coordinates[0]) || 0,
      lng: Number(source.coordinates[1]) || 0,
    };
  } else if (source.coordinates && typeof source.coordinates === 'object') {
    coordinates = {
      lat: Number(source.coordinates.lat ?? source.coordinates.latitude ?? 0),
      lng: Number(source.coordinates.lng ?? source.coordinates.longitude ?? 0),
    };
  }

  let budget: TripPlanResponse['budget'] = {
    total: 0,
    currency: 'INR',
    breakdown: [],
    daily_breakdown: [],
  };

  if (Array.isArray(source.budget)) {
    const breakdown = source.budget.map((item: Record<string, unknown>, index: number) => {
      const amount = parseAmountRange(item.amount_range ?? item.amount);
      return {
        category: String(item.category || `Item ${index + 1}`),
        amount,
        percentage: 0,
        notes: String(item.notes || item.amount_range || ''),
      };
    });

    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
    breakdown.forEach((item) => {
      item.percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
    });

    budget = { total, currency: 'INR', breakdown, daily_breakdown: [] };
  } else if (source.budget && typeof source.budget === 'object') {
    const breakdown = Array.isArray(source.budget.breakdown)
      ? source.budget.breakdown.map((item: Record<string, unknown>) => ({
          category: String(item.category || ''),
          amount: Number(item.amount) || parseAmountRange(item.amount_range),
          percentage: Number(item.percentage) || 0,
          notes: String(item.notes || ''),
        }))
      : [];

    budget = {
      total: Number(source.budget.total) || breakdown.reduce((sum, item) => sum + item.amount, 0),
      currency: String(source.budget.currency || 'INR'),
      breakdown,
      daily_breakdown: Array.isArray(source.budget.daily_breakdown)
        ? source.budget.daily_breakdown.map((item: Record<string, unknown>) => ({
            day: Number(item.day) || 0,
            spent: Number(item.spent ?? item.spend) || 0,
          }))
        : [],
    };
  }

  const itinerary: DayPlanItem[] = Array.isArray(source.itinerary)
    ? source.itinerary.map((day: Record<string, unknown>, index: number) => ({
        day_number: Number(day.day_number ?? day.day ?? index + 1),
        title: String(day.title || `Day ${index + 1}`),
        notes: String(day.notes || day.description || ''),
        activities: Array.isArray(day.activities)
          ? day.activities.map((activity: unknown, activityIndex: number) => {
              if (typeof activity === 'string') {
                return {
                  time: '',
                  title: activity,
                  description: '',
                  category: 'activity',
                  icon: guessIcon(activity),
                };
              }

              const item = (activity ?? {}) as Record<string, unknown>;
              const title = String(item.title || `Activity ${activityIndex + 1}`);

              return {
                time: String(item.time || ''),
                title,
                description: String(item.description || ''),
                category: String(item.category || 'activity'),
                icon: String(item.icon || guessIcon(title)),
              };
            })
          : [],
      }))
    : [];

  const locations: LocationItem[] = Array.isArray(source.locations)
    ? source.locations.map((location: Record<string, unknown>, index: number) => ({
        id: String(location.id || `loc_${index}`),
        name: String(location.name || ''),
        description: String(location.description || ''),
        lat: Number(location.lat ?? location.latitude ?? 0),
        lng: Number(location.lng ?? location.longitude ?? 0),
        type: String(location.type || 'activity'),
      }))
    : [];

  return {
    schema_version: String(source.schema_version || '1.0'),
    trip_request: String(source.trip_request || ''),
    destination: extractDestination(source),
    summary: String(source.summary || ''),
    coordinates,
    accommodation: Array.isArray(source.accommodation)
      ? source.accommodation.map((stay: Record<string, unknown>) => ({
          name_or_area: String(stay.name_or_area || stay.name || ''),
          notes: String(stay.notes || ''),
          typical_price_range: String(stay.typical_price_range || ''),
        }))
      : [],
    itinerary,
    budget,
    locations,
    tips_and_caveats: Array.isArray(source.tips_and_caveats)
      ? source.tips_and_caveats.map(String)
      : Array.isArray(source.tips)
        ? source.tips.map(String)
        : [],
    sources_from_research: Array.isArray(source.sources_from_research)
      ? source.sources_from_research.map((item: Record<string, unknown>) => ({
          title: String(item.title || ''),
          url: String(item.url || ''),
        }))
      : [],
    uncertainty_notes: String(source.uncertainty_notes || ''),
  };
}

export async function generateTripPlan(prompt: string): Promise<TripPlanResponse> {
  let response: Response;
  try {
    const requestBody: TripPlanRequest = { trip_request: prompt };
    response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  } catch {
    throw new Error('Could not connect to the server. Please check if the backend is running.');
  }

  if (!response.ok) {
    let detail = `Server error: ${response.status}`;
    try {
      const err = await response.json();
      if (typeof err.detail === 'string') detail = err.detail;
      else if (Array.isArray(err.detail)) detail = err.detail.map((e: { msg: string }) => e.msg).join(', ');
    } catch { /* ignore parse errors */ }
    throw new Error(detail);
  }

  return normalizeTripPlanResponse(await response.json());
}
