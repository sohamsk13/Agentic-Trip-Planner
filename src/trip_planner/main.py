import json
import sys

from trip_planner.crew_service import run_trip_crew
from trip_planner.json_parse import extract_json_object
from trip_planner.schemas import TripPlanPayload


def run_trip_planner() -> None:
    user_input = input("Enter your trip request: ").strip()
    if not user_input:
        print("No trip request entered.", file=sys.stderr)
        sys.exit(1)

    raw = run_trip_crew(user_input, verbose=True)
    print("\nFINAL TRIP PLAN (JSON):\n")
    try:
        payload = TripPlanPayload.model_validate(extract_json_object(raw))
        print(json.dumps(payload.model_dump(), indent=2, ensure_ascii=False))
    except Exception:
        print(
            "Could not parse/validate planner JSON. Raw model output:",
            file=sys.stderr,
        )
        print(raw, file=sys.stderr)
        sys.exit(1)


def run() -> None:
    """Console script entry point (see pyproject `[project.scripts]`)."""
    run_trip_planner()


def train() -> None:
    print(
        "Training is not configured for this project. "
        "Use CrewAI training APIs if you add a training dataset.",
        file=sys.stderr,
    )
    sys.exit(1)


def replay() -> None:
    print(
        "Replay requires a saved crew run. Not configured.",
        file=sys.stderr,
    )
    sys.exit(1)


def test() -> None:
    """Smoke test: core modules import (no LLM API key required)."""
    import trip_planner.agents  # noqa: F401
    import trip_planner.crew_service  # noqa: F401

    print("OK: trip_planner smoke test passed.")


def run_with_trigger() -> None:
    print(
        "Trigger-based runs are not configured. Use `trip_planner` or `run_crew`.",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    run_trip_planner()
