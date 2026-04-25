from crewai import Task

from trip_planner.agents import TripAgents
from trip_planner.schemas import TRIP_PLAN_JSON_SPEC


def create_tasks(user_input: str, agents: TripAgents) -> list[Task]:
    research_task = Task(
        description=(
            f"Travel request: {user_input}\n\n"
            "Do NOT use web search or external tools. Use only your training knowledge "
            "and reasoning to produce compact trip notes covering: typical routes or "
            "transport angles (no live prices), 2–3 accommodation ideas or areas, "
            "a rough day-by-day outline, and an indicative budget range expressed as "
            "ranges or qualitative bands. Label anything uncertain explicitly. "
            "Never present invented real-time fares, availability, or booking links as fact."
        ),
        agent=agents.research,
        expected_output=(
            "Bullet notes: transport, stays, itinerary sketch, budget bands — clearly "
            "marked where based on general knowledge vs. uncertain."
        ),
    )

    final_task = Task(
        description=(
            "Using ONLY the research task output as your source of facts, write the "
            "final trip document with these sections: "
            "1) Summary  2) Accommodation 3) Day-by-day itinerary "
            "4) Budget breakdown 5) Tips / caveats. "
            "Keep wording clear; flag uncertainty where the notes were thin."
        ),
        agent=agents.writer,
        context=[research_task],
        expected_output="Single cohesive markdown-style trip plan for the traveler.",
    )

    

    data_format_task = Task(
        description=(
            "Using ONLY the prior task outputs as facts, produce the backend/frontend "
            "trip payload.\n\n"
            f"{TRIP_PLAN_JSON_SPEC}"
        ),
        agent=agents.data_format,
        context=[research_task, final_task],
        expected_output=(
            "A single JSON object exactly following the schema (no extra keys required "
            "beyond the spec; arrays must exist; use empty strings/lists when unknown)."
        ),
    )


    return [research_task, final_task, data_format_task]
