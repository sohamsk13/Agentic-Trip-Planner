# Backend-First FastAPI Migration Plan

Your project is already mostly converted to FastAPI (`src/trip_planner/api.py` exists).  
Use this checklist to make the backend production-ready before frontend work.

## 1) Keep one backend entrypoint

Use this file as your API service:

- `src/trip_planner/api.py`
- endpoint: `POST /api/v1/trips/plan`
- health check: `GET /health`

Current request/response contract:

```json
// request
{
  "trip_request": "5 day trip to Bali from Delhi in June"
}
```

```json
// response (validated by Pydantic)
{
  "schema_version": "1.0",
  "trip_request": "...",
  "summary": "...",
  "flights": [],
  "accommodation": [],
  "itinerary": [],
  "budget": [],
  "tips_and_caveats": [],
  "sources_from_research": [],
  "uncertainty_notes": ""
}
```

## 2) Recommended backend folder structure

Move toward this structure (incrementally):

```text
src/trip_planner/
  api.py                 # FastAPI app creation + middleware
  routers/
    trips.py             # /api/v1/trips routes
  services/
    planner_service.py   # run_trip_crew + parse + validate
  schemas.py             # Pydantic response models (already present)
  config.py
```

## 3) Split route and service layers

### `src/trip_planner/services/planner_service.py`

```python
from __future__ import annotations

import json
from typing import Any

from pydantic import ValidationError

from trip_planner.crew_service import run_trip_crew
from trip_planner.json_parse import extract_json_object
from trip_planner.schemas import TripPlanPayload


class PlannerServiceError(Exception):
    pass


def generate_trip_plan(trip_request: str) -> TripPlanPayload:
    raw = run_trip_crew(trip_request.strip(), verbose=False)
    try:
        data: dict[str, Any] = extract_json_object(raw)
    except (ValueError, json.JSONDecodeError) as exc:
        raise PlannerServiceError("Planner returned invalid JSON.") from exc

    try:
        return TripPlanPayload.model_validate(data)
    except ValidationError as exc:
        raise PlannerServiceError(f"Planner response failed validation: {exc}") from exc
```

### `src/trip_planner/routers/trips.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from trip_planner.schemas import TripPlanPayload
from trip_planner.services.planner_service import PlannerServiceError, generate_trip_plan

router = APIRouter(prefix="/api/v1/trips", tags=["trips"])


class PlanTripRequest(BaseModel):
    trip_request: str = Field(..., min_length=1, max_length=8000)


@router.post("/plan", response_model=TripPlanPayload)
def plan_trip(body: PlanTripRequest) -> TripPlanPayload:
    try:
        return generate_trip_plan(body.trip_request)
    except PlannerServiceError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
```

### `src/trip_planner/api.py` (simplified app wiring)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from trip_planner.routers.trips import router as trips_router

app = FastAPI(title="Trip Planner API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trips_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

## 4) Run backend locally

From project root:

```bash
uv sync
uv run uvicorn trip_planner.api:app --reload --host 0.0.0.0 --port 8000
```

Check:

- `http://localhost:8000/health`
- `http://localhost:8000/docs` (Swagger UI)

## 5) Test endpoint quickly

```bash
curl -X POST "http://localhost:8000/api/v1/trips/plan" \
  -H "Content-Type: application/json" \
  -d "{\"trip_request\":\"4 day Goa trip from Mumbai, budget friendly\"}"
```

## 6) Backend hardening before frontend

- Add request timeout guard around crew calls.
- Add basic logging for request ID + failures.
- Restrict CORS origins (no `"*"` in production).
- Add one integration test for `/api/v1/trips/plan`.
- Add simple rate limit (optional, but useful).
