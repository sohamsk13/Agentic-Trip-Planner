# Trip Planner — Roadmap to a More Impressive Product

This document outlines how to elevate the project: product quality, reliability, UX, and technical depth. The backend now uses **LLM-only reasoning** (no live web search) so plans stay consistent when external search APIs fail—always emphasize **uncertainty** and **non‑binding estimates** in copy and UI.

---
---
## 1. Product and positioning

- **Clear promise**: Market as an “AI itinerary sketch + budget bands” tool, not live booking or guaranteed prices. Reduces disappointment and builds trust.
- **Differentiators**: Focus on structured JSON output, export/share, and a polished viewer—few trip demos do all three well.
- **Tone**: Friendly but cautious copy where the model admits limits (`uncertainty_notes` is first-class).

---

## 1. Product and positioning

- **Clear promise**: Market as an “AI itinerary sketch + budget bands” tool, not live booking or guaranteed prices. Reduces disappointment and builds trust.
- **Differentiators**: Focus on structured JSON output, export/share, and a polished viewer—few trip demos do all three well.
- **Tone**: Friendly but cautious copy where the model admits limits (`uncertainty_notes` is first-class).

---

## 2. Backend and AI pipeline

- **Streaming**: Stream partial LLM output or at least SSE for “thinking” phases (research → write → JSON) so the API feels responsive.
- **Retries and fallbacks**: If JSON validation fails once, one automatic reformulation pass with a strict “fix JSON only” prompt; cap total LLM calls.
- **Timeouts**: Hard timeout on `crew.kickoff()` so the API never hangs indefinitely.
- **Async FastAPI**: Run blocking crew work in `asyncio.to_thread` or a process pool so `/health` and other routes stay healthy under load.
- **Idempotency**: Optional `Idempotency-Key` header for `POST /api/v1/trips/plan` to avoid double-charging or duplicate plans.
- **Versioning**: Keep `schema_version` and add `/api/v2/...` when breaking the JSON contract.
- **Observability**: Structured logging (request id, latency, validation success/failure), optional OpenTelemetry.
- **Config**: Single `TRIP_PLANNER_LLM_ONLY=true` (already the default behavior) documented in `.env.example`.
- **Testing**: Contract tests against `TripPlanPayload`, and one golden JSON sample for the formatter agent.

---

## 3. Security and operations

- **Secrets**: Never log API keys; use env + secret manager in production.
- **CORS**: Replace `allow_origins=["*"]` with explicit frontend origins.
- **Rate limiting**: Per-IP or per-key limits on the plan endpoint.
- **Input safety**: Max body size, prompt-injection-aware system messages (refuse unrelated instructions that try to override the schema).

---

## 4. Data and persistence (optional but high impact)

- **Save plans**: SQLite or Postgres with user id, prompt, payload, created_at—enables history, favorites, and “duplicate this trip.”
- **Anonymous sessions**: Cookie or local session id before you add full auth.

---

## 5. Frontend experience (summary)

See **`Frontend_plan.md`** for a full UX spec. High-level ideas:

- **Trust layer**: Prominent banner that info is model-generated, not live availability.
- **Uncertainty first**: Surface `uncertainty_notes` and empty `sources_from_research` honestly (LLM-only mode).
- **Exports**: PDF, Markdown, copy JSON, share link (if you add persistence).

---

## 6. What not to do (with LLM-only research)

- Do not imply real-time flight or hotel prices; use ranges and qualifiers.
- Do not fabricate URLs in `sources_from_research`; keep arrays empty or use `"General knowledge"` with empty URLs per schema rules.

---

## 7. Quick wins (order of impact)

1. Async + timeout around `run_trip_crew`.
2. Replace wildcard CORS with your frontend origin(s).
3. Retry once on JSON parse/validation failure.
4. Add request ID logging.
5. Ship a minimal hosted frontend that reads the same JSON contract.

This roadmap keeps the codebase small while making the demo and production story significantly more compelling.
