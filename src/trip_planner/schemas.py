"""Canonical trip plan JSON shape for agent output and API responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SourceRef(BaseModel):
    model_config = {"extra": "ignore"}

    title: str = ""
    url: str = ""


class StayOption(BaseModel):
    model_config = {"extra": "ignore"}

    name_or_area: str = ""
    notes: str = ""
    typical_price_range: str = ""


class ActivityItem(BaseModel):
    model_config = {"extra": "ignore"}

    time: str = ""
    title: str = ""
    description: str = ""
    category: str = "activity"
    icon: str = "activity"


class DayPlanItem(BaseModel):
    model_config = {"extra": "ignore"}

    day_number: int = Field(..., ge=1)
    title: str = ""
    activities: list[ActivityItem] = Field(default_factory=list)
    notes: str = ""


class BudgetLineItem(BaseModel):
    model_config = {"extra": "ignore"}

    category: str = ""
    amount: float = 0.0
    percentage: float = 0.0
    notes: str = ""


class Coordinates(BaseModel):
    model_config = {"extra": "ignore"}

    lat: float = 0.0
    lng: float = 0.0


class LocationItem(BaseModel):
    model_config = {"extra": "ignore"}

    id: str = ""
    name: str = ""
    description: str = ""
    lat: float = 0.0
    lng: float = 0.0
    type: str = "activity"


class BudgetSummary(BaseModel):
    model_config = {"extra": "ignore"}

    total: float = 0.0
    currency: str = "INR"
    breakdown: list[BudgetLineItem] = Field(default_factory=list)
    daily_breakdown: list[dict] = Field(default_factory=list)


class TripPlanPayload(BaseModel):
    """Fixed contract for formatter agent and POST /api/v1/trips/plan response."""

    model_config = {"extra": "ignore"}

    schema_version: str = Field(default="1.0", description="Payload format version.")
    trip_request: str = ""
    destination: str = ""
    summary: str = ""
    coordinates: Coordinates = Field(default_factory=Coordinates)
    accommodation: list[StayOption] = Field(default_factory=list)
    itinerary: list[DayPlanItem] = Field(default_factory=list)
    budget: BudgetSummary = Field(default_factory=BudgetSummary)
    locations: list[LocationItem] = Field(default_factory=list)
    tips_and_caveats: list[str] = Field(default_factory=list)
    sources_from_research: list[SourceRef] = Field(default_factory=list)
    uncertainty_notes: str = ""


TRIP_PLAN_JSON_SPEC = """
You MUST output a single JSON object only (no markdown outside the JSON, no prose).
Do not wrap the JSON in code fences unless the system requires it; prefer raw JSON.

Exact shape (all keys required; use "" or [] when unknown):

{
  "schema_version": "1.0",
  "trip_request": "<echo the user's original trip request verbatim>",
  "destination": "<city or region name, e.g. Goa, India>",
  "summary": "<2-6 sentences>",
  "coordinates": { "lat": 0.0, "lng": 0.0 },
  "accommodation": [
    {
      "name_or_area": "",
      "notes": "",
      "typical_price_range": ""
    }
  ],
  "itinerary": [
    {
      "day_number": 1,
      "title": "",
      "activities": [
        {
          "time": "9:00 AM",
          "title": "",
          "description": "",
          "category": "activity",
          "icon": "activity"
        }
      ],
      "notes": ""
    }
  ],
  "budget": {
    "total": 0,
    "currency": "INR",
    "breakdown": [
      { "category": "", "amount": 0, "percentage": 0, "notes": "" }
    ],
    "daily_breakdown": [
      { "day": 1, "spent": 0 }
    ]
  },
  "locations": [
    {
      "id": "loc_1",
      "name": "",
      "description": "",
      "lat": 0.0,
      "lng": 0.0,
      "type": "activity"
    }
  ],
  "tips_and_caveats": ["..."],
  "sources_from_research": [
    { "title": "", "url": "" }
  ],
  "uncertainty_notes": "<where data was thin or missing; never invent exact prices>"
}

Rules:
- destination: short human-readable place name (city, region).
- coordinates: real approximate lat/lng for the destination center. Use your training knowledge.
- locations: list 3-6 key places from the itinerary with real approximate lat/lng coordinates.
- icon field must be one of: hotel, beach, food, activity, sunset, transport.
- budget.total is a number (no currency symbol). budget.currency is the ISO code e.g. INR, USD.
- budget.breakdown amounts must sum to approximately budget.total.
- Research is LLM-only (no live web). Leave sources_from_research empty or use titles like
  \"General knowledge\" with empty url — do not invent article URLs.
- Use ONLY facts supported by the prior tasks (research + written plan). If unsure, say so in uncertainty_notes.
- day_number must be a positive integer starting at 1 for each day you include.
- Arrays may be empty but must be present.
""".strip()
