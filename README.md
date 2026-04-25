# TripPlanner Crew

Welcome to the TripPlanner Crew project, powered by [crewAI](https://crewai.com). This template is designed to help you set up a multi-agent AI system with ease, leveraging the powerful and flexible framework provided by crewAI. Our goal is to enable your agents to collaborate effectively on complex tasks, maximizing their collective intelligence and capabilities.

## Installation

Ensure you have Python >=3.10 <3.14 installed on your system. This project uses [UV](https://docs.astral.sh/uv/) for dependency management and package handling, offering a seamless setup and execution experience.

First, if you haven't already, install uv:

```bash
pip install uv
```

Frontend → Backend API → AI Agent → JSON → Validate → Frontend UI

Next, navigate to your project directory and install the dependencies:

(Optional) Lock the dependencies and install them by using the CLI command:
```bash
crewai install
```
### Customizing

**Add `GEMINI_API_KEY` or `GOOGLE_API_KEY` to your `.env` file** (Gemini is the default LLM).

- Agents: `src/trip_planner/agents.py` (`build_agents`, `TripAgents`)
- Tasks: `src/trip_planner/tasks.py` (`create_tasks`)
- LLM settings: `src/trip_planner/config.py` (optional: `CREWAI_TEMPERATURE`; default model is set in `config.py`. If the API returns 404 for a model name, set `CREWAI_LLM_MODEL` to a current Gemini model ID from Google’s docs)
- Entry flow: `src/trip_planner/main.py`

##

## Running the Project

To kickstart your crew of AI agents and begin task execution, run this from the root folder of your project:

```bash
uv sync
uv run trip_planner
```

Or: `uv run run_crew` (same as `trip_planner`). Smoke check without calling the LLM: `uv run test`.

This flow prompts for a trip request and prints a combined plan from the crew.

## Understanding Your Crew

The crew runs **three sequential tasks** with **three agents**: a researcher drafts notes from **LLM knowledge only** (no web search), a writer turns that into a readable plan, and a formatter produces validated JSON for the API. See `agents.py` and `tasks.py`.

## Support

For support, questions, or feedback regarding the TripPlanner Crew or crewAI.
- Visit our [documentation](https://docs.crewai.com)
- Reach out to us through our [GitHub repository](https://github.com/joaomdmoura/crewai)
- [Join our Discord](https://discord.com/invite/X4JWnZnxPb)
- [Chat with our docs](https://chatg.pt/DWjSBZn)

Let's create wonders together with the power and simplicity of crewAI.
