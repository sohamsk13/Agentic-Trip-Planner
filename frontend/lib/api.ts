const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_ENDPOINT = '/api/v1/trips/plan';

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

export async function generateTripPlan(prompt: string): Promise<TripPlanResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_request: prompt }),
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

  const data: TripPlanResponse = await response.json();
  return data;
}
