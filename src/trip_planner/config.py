import os
from functools import lru_cache

from crewai import LLM
from dotenv import load_dotenv

load_dotenv()


def _api_key() -> str:
    key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("OPENAI_API_KEY")
    )
    if not key:
        raise ValueError(
            "Set GEMINI_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY in your environment or .env file."
        )
    return key


_DEFAULT_MODEL = "gemini-2.5-flash"


@lru_cache(maxsize=1)
def get_llm() -> LLM:
    """Lazy LLM so importing the package does not require credentials."""
    return LLM(
        model=os.getenv("CREWAI_LLM_MODEL", _DEFAULT_MODEL),
        api_key=_api_key(),
        temperature=float(os.getenv("CREWAI_TEMPERATURE", "0.7")),
    )