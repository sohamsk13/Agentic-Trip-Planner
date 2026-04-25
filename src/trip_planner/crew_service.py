"""Run the CrewAI trip pipeline (shared by CLI and API)."""

from __future__ import annotations

from crewai import Crew, Process

from trip_planner.agents import build_agents
from trip_planner.tasks import create_tasks


def run_trip_crew(user_input: str, *, verbose: bool = True) -> str:
    """Execute research → writer → JSON formatter; returns final task output as text."""
    trip_agents = build_agents()
    tasks = create_tasks(user_input, trip_agents)

    crew = Crew(
        agents=[trip_agents.research, trip_agents.writer, trip_agents.data_format],
        tasks=tasks,
        process=Process.sequential,
        verbose=verbose,
    )

    result = crew.kickoff()
    return str(result).strip()
