"""Extract a JSON object from LLM text (raw JSON or fenced blocks)."""

from __future__ import annotations

import json
import re
from typing import Any


def extract_json_object(text: str) -> dict[str, Any]:
    if not text or not str(text).strip():
        raise ValueError("Empty model output.")

    raw = str(text).strip()

    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw, re.IGNORECASE)
    candidate = fenced.group(1).strip() if fenced else raw

    start = candidate.find("{")
    end = candidate.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in model output.")

    return json.loads(candidate[start : end + 1])
