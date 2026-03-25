from collections.abc import Iterable

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

    scored.sort(
        key=lambda entry: (
            entry["score"],
            -entry["item"].times_worn,
        ),
        reverse=True,
    )

    return scored[:3]
