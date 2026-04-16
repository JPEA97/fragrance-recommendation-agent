import json
import logging
import os
from dataclasses import dataclass

from pydantic import ValidationError
from pydantic_ai import Agent, RunContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.brand import Brand
from app.models.collection_item import CollectionItem
from app.models.fragrance import Fragrance
from app.models.fragrance_tag import FragranceTag
from app.models.tag import Tag
from app.schemas.recommendation import RecommendationRequest
from app.services.recommendation import build_recommendations

logger = logging.getLogger(__name__)

os.environ["ANTHROPIC_API_KEY"] = settings.anthropic_api_key

MODEL = "anthropic:claude-haiku-4-5-20251001"

SYSTEM_PROMPT = """You are a fragrance recommendation assistant for S.O.T.D. (Scent of the Day).
Your job is to help users find the perfect fragrance from their personal collection based on natural language descriptions of their plans, mood, or occasion.

When a user asks for a recommendation, follow these steps in order:
1. Call get_collection_context to understand what fragrances the user owns and their tags.
2. Interpret the user's query and map it to these exact parameter values:
   - season: spring | summer | fall | winter
   - occasion: casual | office | date | wedding | formal | party | sport | beach | travel
   - time_of_day: morning | day | evening | night
   - weather: hot | mild | cold | rainy
   - location_type: indoor | outdoor
3. Call score_fragrances with those parameters to get the ranked results.
4. Return a warm, conversational 2-3 sentence response naming the top 2-3 picks and briefly explaining why each fits.

Always call both tools before responding. If the user's query is ambiguous, make a reasonable inference."""


@dataclass
class AgentDeps:
    db: Session
    user_id: int
    top_picks: list = None

    def __post_init__(self):
        if self.top_picks is None:
            self.top_picks = []


agent = Agent(
    MODEL,
    deps_type=AgentDeps,
    system_prompt=SYSTEM_PROMPT,
)


@agent.tool
def get_collection_context(ctx: RunContext[AgentDeps]) -> str:
    """Get a summary of the user's fragrance collection: names, brands, personal ratings, wear count, and context tags."""
    rows = (
        ctx.deps.db.query(CollectionItem, Fragrance, Brand, Tag)
        .join(Fragrance, CollectionItem.fragrance_id == Fragrance.id)
        .join(Brand, Fragrance.brand_id == Brand.id)
        .join(FragranceTag, FragranceTag.fragrance_id == Fragrance.id)
        .join(Tag, Tag.id == FragranceTag.tag_id)
        .filter(CollectionItem.user_id == ctx.deps.user_id)
        .all()
    )

    if not rows:
        return "The user's collection is empty — no fragrances to recommend."

    grouped: dict = {}
    for item, fragrance, brand, tag in rows:
        key = item.id
        if key not in grouped:
            grouped[key] = {
                "name": fragrance.name,
                "brand": brand.name,
                "rating": item.personal_rating,
                "times_worn": item.times_worn,
                "tags": [],
            }
        grouped[key]["tags"].append(f"{tag.type}:{tag.name}")

    lines = []
    for entry in grouped.values():
        tag_str = ", ".join(sorted(entry["tags"]))
        rating_str = f"rated {entry['rating']}/10" if entry["rating"] else "unrated"
        lines.append(
            f"- {entry['brand']} {entry['name']} "
            f"({rating_str}, worn {entry['times_worn']}x) | {tag_str}"
        )

    return f"Collection ({len(grouped)} fragrances with tags):\n" + "\n".join(lines)


@agent.tool
def score_fragrances(
    ctx: RunContext[AgentDeps],
    season: str,
    occasion: str,
    time_of_day: str,
    weather: str,
    location_type: str,
) -> str:
    """Score and rank the user's fragrances against the given context. Returns the top 3 matches with scores and reasons."""
    try:
        payload = RecommendationRequest(
            season=season,
            occasion=occasion,
            time_of_day=time_of_day,
            weather=weather,
            location_type=location_type,
        )
    except ValidationError as e:
        return f"Invalid context parameters: {e}. Use only the allowed values listed in your instructions."

    rows = (
        ctx.deps.db.query(CollectionItem, Fragrance, Brand, Tag)
        .join(Fragrance, CollectionItem.fragrance_id == Fragrance.id)
        .join(Brand, Fragrance.brand_id == Brand.id)
        .join(FragranceTag, FragranceTag.fragrance_id == Fragrance.id)
        .join(Tag, Tag.id == FragranceTag.tag_id)
        .filter(CollectionItem.user_id == ctx.deps.user_id)
        .all()
    )

    if not rows:
        return "No fragrances available to score."

    results = build_recommendations(rows, payload)

    if not results:
        return "No matching fragrances found for that context."

    ctx.deps.top_picks = [
        {"brand": entry["brand"].name, "name": entry["fragrance"].name}
        for entry in results
    ]

    lines = []
    for i, entry in enumerate(results, 1):
        lines.append(
            f"{i}. {entry['brand'].name} {entry['fragrance'].name} "
            f"(score: {entry['score']}) — {entry['reason']}"
        )

    context_summary = f"{season} / {occasion} / {time_of_day} / {weather} / {location_type}"
    return f"Top matches for [{context_summary}]:\n" + "\n".join(lines)


def run_agent(query: str, db: Session, user_id: int) -> tuple[str, list]:
    """
    Run the agent for a natural language fragrance query.
    Returns (final_response, steps) where steps is the serialized message history.
    """
    deps = AgentDeps(db=db, user_id=user_id)
    result = agent.run_sync(query, deps=deps)

    steps = json.loads(result.all_messages_json())

    logger.info("Agent run complete user_id=%s steps=%d", user_id, len(steps))
    return result.output, steps, deps.top_picks
