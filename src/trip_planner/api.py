"""FastAPI service exposing the trip planner as structured JSON."""

from __future__ import annotations

import json
from typing import Any



from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError

from trip_planner.crew_service import run_trip_crew
from trip_planner.json_parse import extract_json_object
from trip_planner.schemas import TripPlanPayload

app = FastAPI(
    title="Trip Planner API",
    version="0.1.0",
    description=(
        "Runs the CrewAI pipeline (LLM knowledge only; no live web search) and returns "
        "a validated trip plan JSON payload."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PlanTripRequest(BaseModel):
    trip_request: str = Field(..., min_length=1, max_length=8000)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}





@app.post("/api/v1/trips/plan", response_model=TripPlanPayload)
def plan_trip(body: PlanTripRequest) -> TripPlanPayload:
    raw = run_trip_crew(body.trip_request.strip(), verbose=False)
    try:
        data: dict[str, Any] = extract_json_object(raw)
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=422,
            detail="The planner did not return parseable JSON. Try rephrasing the request.",
        ) from exc

    try:
        return TripPlanPayload.model_validate(data)
    except ValidationError as exc:
        raise HTTPException(
            status_code=422,
            detail=exc.errors(include_url=False),
        ) from exc


def run_server() -> None:
    import uvicorn

    uvicorn.run(
        "trip_planner.api:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
