from dataclasses import dataclass

from crewai import Agent

from trip_planner.config import get_llm



@dataclass(frozen=True)
class TripAgents:
    research: Agent
    writer: Agent
    data_format: Agent


def build_agents() -> TripAgents:
   
    llm = get_llm()

    # Tight iteration caps. Research is LLM-only (no web search tools).
    research = Agent(
        role="Trip researcher",
        goal=(
            "Produce practical travel briefing notes from general knowledge only—no web "
            "search, no crawling. Synthesize routes, stays, itinerary ideas, and budget "
            "bands; be explicit when information is approximate or outdated."
        ),
        backstory=(
            "You work offline from model knowledge: you never call search tools or "
            "claim live data. You structure clear, cautious notes that downstream "
            "agents can turn into a plan without fabricating bookings or exact prices."
        ),
        tools=[],
        llm=llm,
        verbose=True,
        max_iter=2,
        max_retry_limit=1,
        allow_delegation=False,
    )

    writer = Agent(
        role="Trip plan writer",
        goal=(
            "Turn research notes into a polished, structured trip plan "
            "(hotels, day-by-day plan, budget)."
        ),
        backstory=(
            "Professional travel editor. You do not search the web; you only structure "
            "and clarify the prior research output."
        ),
        tools=[],
        llm=llm,
        verbose=True,
        max_iter=1,
        max_retry_limit=1,
        allow_delegation=False,
    )


    data_format = Agent(
        role="Trip plan JSON formatter",
        goal=(
            "Convert the finalized trip plan into ONE JSON object matching the project's "
            "fixed schema: required keys, correct types, no commentary outside JSON."
        ),
        backstory=(
            "You serialize travel plans for APIs. You never invent prices or bookings; "
            "you reflect uncertainty in uncertainty_notes. You output only valid JSON."
        ),
        tools=[],
        llm=llm,
        verbose=True,
        max_iter=1,
        max_retry_limit=1,
        allow_delegation=False,
    )

    return TripAgents(research=research, writer=writer, data_format=data_format)
