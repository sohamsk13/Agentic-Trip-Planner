"""FastAPI service exposing the trip planner as structured JSON."""

from __future__ import annotations

import asyncio
import json
import os
from typing import Any

from fastapi import FastAPI, HTTPException, Request
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

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


class PlanTripRequest(BaseModel):
    trip_request: str = Field(..., min_length=1, max_length=2000)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/v1/trips/plan", response_model=TripPlanPayload)
async def plan_trip(body: PlanTripRequest) -> TripPlanPayload:
    loop = asyncio.get_event_loop()
    try:
        raw = await asyncio.wait_for(
            loop.run_in_executor(None, lambda: run_trip_crew(body.trip_request.strip(), verbose=False)),
            timeout=float(os.getenv("CREW_TIMEOUT_SECONDS", "300")),
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Trip planning timed out. Please try a simpler request.")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Planning failed: {exc}") from exc

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
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("RELOAD", "false").lower() == "true",
    )
