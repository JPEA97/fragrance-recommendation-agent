import random
from collections.abc import Iterable

from app.models.brand import Brand
from app.models.collection_item import CollectionItem
from app.models.fragrance import Fragrance
from app.models.tag import Tag
from app.schemas.recommendation import RecommendationRequest


def build_recommendation(rows: Iterable, payload: RecommendationRequest):
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
        penalty = min(item.times_worn, 5)

        if ("occasion", payload.occasion) in tags:
            score += 5
        if ("weather", payload.weather) in tags:
            score += 5
        if ("season", payload.season) in tags:
            score += 3
        if ("time_of_day", payload.time_of_day) in tags:
            score += 3
        if ("location_type", payload.location_type) in tags:
            score += 3

        rating_bonus = min(item.personal_rating or 0, 3)
        score += rating_bonus
        score -= penalty

        scored.append(
            {
                "item": item,
                "fragrance": fragrance,
                "brand": brand,
                "score": score,
            }
        )

    if not scored:
        return None

    max_score = max(entry["score"] for entry in scored)
    top_scored = [entry for entry in scored if entry["score"] == max_score]

    min_times_worn = min(entry["item"].times_worn for entry in top_scored)
    least_worn = [
        entry for entry in top_scored if entry["item"].times_worn == min_times_worn
    ]

    return random.choice(least_worn)
