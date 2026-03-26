from types import SimpleNamespace

from app.schemas.recommendation import RecommendationRequest
from app.services.recommendation import build_recommendations


def make_row(
    *,
    item_id: int,
    fragrance_id: int,
    fragrance_name: str,
    brand_name: str,
    tags: list[tuple[str, str]],
    personal_rating: int | None = None,
    times_worn: int = 0,
):
    item = SimpleNamespace(
        id=item_id,
        personal_rating=personal_rating,
        times_worn=times_worn,
    )
    fragrance = SimpleNamespace(
        id=fragrance_id,
        name=fragrance_name,
    )
    brand = SimpleNamespace(
        name=brand_name,
    )

    rows = []
    for tag_type, tag_name in tags:
        tag = SimpleNamespace(type=tag_type, name=tag_name)
        rows.append((item, fragrance, brand, tag))

    return rows


def test_build_recommendations_returns_top_three_only():
    payload = RecommendationRequest(
        season="fall",
        occasion="date",
        time_of_day="evening",
        weather="cold",
        location_type="indoor",
    )

    rows = []
    rows += make_row(
        item_id=1,
        fragrance_id=1,
        fragrance_name="A",
        brand_name="Brand",
        tags=[
            ("season", "fall"),
            ("occasion", "date"),
            ("time_of_day", "evening"),
            ("weather", "cold"),
            ("location_type", "indoor"),
        ],
        personal_rating=9,
        times_worn=0,
    )
    rows += make_row(
        item_id=2,
        fragrance_id=2,
        fragrance_name="B",
        brand_name="Brand",
        tags=[
            ("season", "fall"),
            ("occasion", "date"),
            ("time_of_day", "evening"),
            ("weather", "cold"),
        ],
        personal_rating=8,
        times_worn=0,
    )
    rows += make_row(
        item_id=3,
        fragrance_id=3,
        fragrance_name="C",
        brand_name="Brand",
        tags=[
            ("season", "fall"),
            ("occasion", "date"),
            ("weather", "cold"),
        ],
        personal_rating=7,
        times_worn=0,
    )
    rows += make_row(
        item_id=4,
        fragrance_id=4,
        fragrance_name="D",
        brand_name="Brand",
        tags=[
            ("occasion", "casual"),
        ],
        personal_rating=6,
        times_worn=0,
    )

    result = build_recommendations(rows, payload)

    assert len(result) == 3
    names = [entry["fragrance"].name for entry in result]
    assert names == ["A", "B", "C"]


def test_stronger_context_match_ranks_higher_than_weaker_match():
    payload = RecommendationRequest(
        season="fall",
        occasion="date",
        time_of_day="evening",
        weather="cold",
        location_type="indoor",
    )

    strong_rows = make_row(
        item_id=1,
        fragrance_id=1,
        fragrance_name="Strong Match",
        brand_name="Brand",
        tags=[
            ("season", "fall"),
            ("occasion", "date"),
            ("time_of_day", "evening"),
            ("weather", "cold"),
            ("location_type", "indoor"),
        ],
        personal_rating=6,
        times_worn=0,
    )

    weak_rows = make_row(
        item_id=2,
        fragrance_id=2,
        fragrance_name="Weak Match",
        brand_name="Brand",
        tags=[
            ("season", "fall"),
            ("location_type", "indoor"),
        ],
        personal_rating=9,
        times_worn=0,
    )

    result = build_recommendations(strong_rows + weak_rows, payload)

    assert result[0]["fragrance"].name == "Strong Match"


def test_lower_times_worn_wins_when_scores_tie():
    payload = RecommendationRequest(
        season="fall",
        occasion="date",
        time_of_day="evening",
        weather="cold",
        location_type="indoor",
    )

    common_tags = [
        ("season", "fall"),
        ("occasion", "date"),
        ("time_of_day", "evening"),
        ("weather", "cold"),
        ("location_type", "indoor"),
    ]

    rows = []
    rows += make_row(
        item_id=1,
        fragrance_id=1,
        fragrance_name="More Worn",
        brand_name="Brand",
        tags=common_tags,
        personal_rating=8,
        times_worn=4,
    )
    rows += make_row(
        item_id=2,
        fragrance_id=2,
        fragrance_name="Less Worn",
        brand_name="Brand",
        tags=common_tags,
        personal_rating=8,
        times_worn=1,
    )

    result = build_recommendations(rows, payload)

    assert result[0]["fragrance"].name == "Less Worn"


def test_reason_mentions_matched_context_and_rating_signal():
    payload = RecommendationRequest(
        season="fall",
        occasion="date",
        time_of_day="evening",
        weather="cold",
        location_type="indoor",
    )

    rows = make_row(
        item_id=1,
        fragrance_id=1,
        fragrance_name="Explained",
        brand_name="Brand",
        tags=[
            ("season", "fall"),
            ("occasion", "date"),
            ("time_of_day", "evening"),
            ("weather", "cold"),
            ("location_type", "indoor"),
        ],
        personal_rating=9,
        times_worn=0,
    )

    result = build_recommendations(rows, payload)

    reason = result[0]["reason"]
    assert "Matches" in reason
    assert "date occasion" in reason
    assert "cold weather" in reason
    assert "highly rated by you" in reason


def test_build_recommendations_returns_empty_list_for_empty_rows():
    payload = RecommendationRequest(
        season="fall",
        occasion="date",
        time_of_day="evening",
        weather="cold",
        location_type="indoor",
    )

    result = build_recommendations([], payload)

    assert result == []
