from collections.abc import Iterable
from datetime import datetime, timezone

from app.models.brand import Brand
from app.models.collection_item import CollectionItem
from app.models.fragrance import Fragrance
from app.schemas.recommendation import RecommendationRequest


def build_recommendations(rows: Iterable, payload: RecommendationRequest) -> list[dict]:
    grouped = {}

    for item, fragrance, brand, tag in rows:
        key = item.id

        if key not in grouped:
            grouped[key] = {
                "item": item,
                "fragrance": fragrance,
                "brand": brand,
                "tags": set(),
            }

        grouped[key]["tags"].add((tag.type, tag.name))

    scored = []

    for data in grouped.values():
        item: CollectionItem = data["item"]
        fragrance: Fragrance = data["fragrance"]
        brand: Brand = data["brand"]
        tags = data["tags"]

        score = 0
        matched_context = []

        if ("occasion", payload.occasion) in tags:
            score += 5
            matched_context.append(f"{payload.occasion} occasion")
        if ("weather", payload.weather) in tags:
            score += 5
            matched_context.append(f"{payload.weather} weather")
        if ("season", payload.season) in tags:
            score += 3
            matched_context.append(f"{payload.season} season")
        if ("time_of_day", payload.time_of_day) in tags:
            score += 3
            matched_context.append(f"{payload.time_of_day} time")
        if ("location_type", payload.location_type) in tags:
            score += 3
            matched_context.append(f"{payload.location_type} setting")

        # Rating bonus: scaled 0–6 across the 1–10 range
        rating = item.personal_rating or 0
        if rating >= 9:
            rating_bonus = 6
        elif rating >= 7:
            rating_bonus = 4
        elif rating >= 5:
            rating_bonus = 2
        else:
            rating_bonus = 0
        score += rating_bonus

        # Recency penalty: decays over 7 days based on last_worn_at
        penalty = 0
        if item.last_worn_at is not None:
            now = datetime.now(timezone.utc)
            last_worn = item.last_worn_at
            if last_worn.tzinfo is None:
                last_worn = last_worn.replace(tzinfo=timezone.utc)
            days_ago = (now - last_worn).days
            if days_ago <= 1:
                penalty = 5
            elif days_ago <= 3:
                penalty = 3
            elif days_ago <= 7:
                penalty = 1
        score -= penalty

        reason_parts = []
        if matched_context:
            reason_parts.append("Matches " + ", ".join(matched_context[:3]))
        if item.personal_rating and item.personal_rating >= 8:
            reason_parts.append("highly rated by you")
        if item.last_worn_at is None:
            reason_parts.append("not yet worn")

        reason = (
            ". ".join(reason_parts)
            if reason_parts
            else "Best available match from your collection"
        )

        scored.append(
            {
                "item": item,
                "fragrance": fragrance,
                "brand": brand,
                "score": score,
                "reason": reason,
            }
        )

    scored.sort(
        key=lambda entry: (
            entry["score"],
            -entry["item"].times_worn,
        ),
        reverse=True,
    )

    return scored[:3]
