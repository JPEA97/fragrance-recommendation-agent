def test_recommendation_returns_top_three_ranked_results(
    client,
    auth_headers,
    db_session,
):
    from app.models.brand import Brand
    from app.models.collection_item import CollectionItem
    from app.models.fragrance import Fragrance
    from app.models.fragrance_tag import FragranceTag
    from app.models.tag import Tag
    from app.models.user import User

    headers = auth_headers(email="rec@example.com", username="recuser")

    user = db_session.query(User).filter(User.email == "rec@example.com").first()
    assert user is not None

    brand = Brand(name="Yves Saint Laurent")
    db_session.add(brand)
    db_session.flush()

    fragrances = [
        Fragrance(
            brand_id=brand.id,
            name="La Nuit de L'Homme",
            release_year=2009,
            gender_category="masculine",
            description="Strong date-night option",
        ),
        Fragrance(
            brand_id=brand.id,
            name="L'Homme",
            release_year=2006,
            gender_category="masculine",
            description="Versatile fresh spicy option",
        ),
        Fragrance(
            brand_id=brand.id,
            name="Y Eau de Parfum",
            release_year=2018,
            gender_category="masculine",
            description="Modern versatile option",
        ),
        Fragrance(
            brand_id=brand.id,
            name="Kouros",
            release_year=1981,
            gender_category="masculine",
            description="Legacy masculine option",
        ),
    ]
    db_session.add_all(fragrances)
    db_session.flush()

    tags = [
        Tag(type="season", name="fall"),
        Tag(type="occasion", name="date"),
        Tag(type="time_of_day", name="evening"),
        Tag(type="weather", name="cold"),
        Tag(type="location_type", name="indoor"),
        Tag(type="occasion", name="casual"),
        Tag(type="weather", name="mild"),
        Tag(type="time_of_day", name="day"),
    ]
    db_session.add_all(tags)
    db_session.flush()

    tag_map = {(tag.type, tag.name): tag for tag in tags}

    def add_tags(fragrance, pairs):
        for pair in pairs:
            db_session.add(
                FragranceTag(
                    fragrance_id=fragrance.id,
                    tag_id=tag_map[pair].id,
                )
            )

    add_tags(
        fragrances[0],
        [
            ("season", "fall"),
            ("occasion", "date"),
            ("time_of_day", "evening"),
            ("weather", "cold"),
            ("location_type", "indoor"),
        ],
    )
    add_tags(
        fragrances[1],
        [
            ("season", "fall"),
            ("occasion", "casual"),
            ("time_of_day", "day"),
            ("weather", "mild"),
            ("location_type", "indoor"),
        ],
    )
    add_tags(
        fragrances[2],
        [
            ("season", "fall"),
            ("occasion", "date"),
            ("time_of_day", "evening"),
            ("weather", "cold"),
        ],
    )
    add_tags(
        fragrances[3],
        [
            ("occasion", "casual"),
            ("weather", "mild"),
        ],
    )

    db_session.add_all(
        [
            CollectionItem(
                user_id=user.id,
                fragrance_id=fragrances[0].id,
                ownership_type="full_bottle",
                personal_rating=9,
                times_worn=1,
            ),
            CollectionItem(
                user_id=user.id,
                fragrance_id=fragrances[1].id,
                ownership_type="full_bottle",
                personal_rating=8,
                times_worn=0,
            ),
            CollectionItem(
                user_id=user.id,
                fragrance_id=fragrances[2].id,
                ownership_type="full_bottle",
                personal_rating=7,
                times_worn=0,
            ),
            CollectionItem(
                user_id=user.id,
                fragrance_id=fragrances[3].id,
                ownership_type="sample",
                personal_rating=6,
                times_worn=0,
            ),
        ]
    )
    db_session.commit()

    response = client.post(
        "/recommendation/",
        json={
            "season": "fall",
            "occasion": "date",
            "time_of_day": "evening",
            "weather": "cold",
            "location_type": "indoor",
        },
        headers=headers,
    )

    assert response.status_code == 200

    payload = response.json()
    assert "data" in payload
    assert "meta" in payload
    assert payload["meta"]["count"] == 3
    assert len(payload["data"]) == 3

    names = [item["name"] for item in payload["data"]]
    assert names[0] == "La Nuit de L'Homme"
    assert "Y Eau de Parfum" in names
    assert "L'Homme" in names
    assert "Kouros" not in names

    for item in payload["data"]:
        assert "reason" in item
        assert isinstance(item["reason"], str)
        assert item["reason"] != ""


def test_recommendation_returns_404_for_empty_collection(
    client,
    auth_headers,
):
    headers = auth_headers(email="empty@example.com", username="emptyuser")

    response = client.post(
        "/recommendation/",
        json={
            "season": "fall",
            "occasion": "date",
            "time_of_day": "evening",
            "weather": "cold",
            "location_type": "indoor",
        },
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["error"]["type"] == "http_error"
    assert response.json()["error"]["message"] == "User collection is empty"


def test_recommendation_prefers_lower_times_worn_on_tie(
    client,
    auth_headers,
    db_session,
):
    from app.models.brand import Brand
    from app.models.collection_item import CollectionItem
    from app.models.fragrance import Fragrance
    from app.models.fragrance_tag import FragranceTag
    from app.models.tag import Tag
    from app.models.user import User

    headers = auth_headers(email="tie@example.com", username="tieuser")

    user = db_session.query(User).filter(User.email == "tie@example.com").first()
    assert user is not None

    brand = Brand(name="Dior")
    db_session.add(brand)
    db_session.flush()

    fragrance_a = Fragrance(
        brand_id=brand.id,
        name="Dior Homme Intense",
        release_year=2011,
        gender_category="masculine",
        description="Tie candidate A",
    )
    fragrance_b = Fragrance(
        brand_id=brand.id,
        name="Dior Homme Original",
        release_year=2005,
        gender_category="masculine",
        description="Tie candidate B",
    )
    db_session.add_all([fragrance_a, fragrance_b])
    db_session.flush()

    tags = [
        Tag(type="season", name="fall"),
        Tag(type="occasion", name="date"),
        Tag(type="time_of_day", name="evening"),
        Tag(type="weather", name="cold"),
        Tag(type="location_type", name="indoor"),
    ]
    db_session.add_all(tags)
    db_session.flush()

    for fragrance in [fragrance_a, fragrance_b]:
        for tag in tags:
            db_session.add(
                FragranceTag(
                    fragrance_id=fragrance.id,
                    tag_id=tag.id,
                )
            )

    db_session.add_all(
        [
            CollectionItem(
                user_id=user.id,
                fragrance_id=fragrance_a.id,
                ownership_type="full_bottle",
                personal_rating=8,
                times_worn=4,
            ),
            CollectionItem(
                user_id=user.id,
                fragrance_id=fragrance_b.id,
                ownership_type="full_bottle",
                personal_rating=8,
                times_worn=1,
            ),
        ]
    )
    db_session.commit()

    response = client.post(
        "/recommendation/",
        json={
            "season": "fall",
            "occasion": "date",
            "time_of_day": "evening",
            "weather": "cold",
            "location_type": "indoor",
        },
        headers=headers,
    )

    assert response.status_code == 200
    payload = response.json()["data"]

    assert payload[0]["name"] == "Dior Homme Original"
