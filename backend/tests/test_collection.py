def test_collection_crud_lifecycle_for_owner(
    client,
    auth_headers,
    seeded_catalog,
):
    headers = auth_headers(email="owner@example.com", username="owneruser")

    create_response = client.post(
        "/collection/",
        json={
            "fragrance_id": seeded_catalog["fragrance"].id,
            "ownership_type": "full_bottle",
            "ml_remaining": 50,
            "personal_rating": 8,
        },
        headers=headers,
    )

    assert create_response.status_code == 201
    created_item = create_response.json()["data"]
    item_id = created_item["id"]
    assert created_item["fragrance_id"] == seeded_catalog["fragrance"].id
    assert created_item["ownership_type"] == "full_bottle"
    assert created_item["ml_remaining"] == 50
    assert created_item["personal_rating"] == 8
    assert created_item["times_worn"] == 0

    list_response = client.get("/collection/", headers=headers)

    assert list_response.status_code == 200
    list_payload = list_response.json()
    assert "data" in list_payload
    assert "meta" in list_payload
    assert list_payload["meta"]["count"] == 1
    assert len(list_payload["data"]) == 1
    assert list_payload["data"][0]["id"] == item_id
    assert list_payload["data"][0]["fragrance"]["name"] == "Dior Homme Intense"

    detail_response = client.get(f"/collection/{item_id}", headers=headers)

    assert detail_response.status_code == 200
    detail_item = detail_response.json()["data"]
    assert detail_item["id"] == item_id
    assert detail_item["fragrance"]["brand"] == "Dior"
    assert detail_item["ownership_type"] == "full_bottle"

    patch_response = client.patch(
        f"/collection/{item_id}",
        json={
            "ownership_type": "sample",
            "ml_remaining": 10,
            "personal_rating": 9,
            "times_worn": 3,
        },
        headers=headers,
    )

    assert patch_response.status_code == 200
    patched_item = patch_response.json()["data"]
    assert patched_item["ownership_type"] == "sample"
    assert patched_item["ml_remaining"] == 10
    assert patched_item["personal_rating"] == 9
    assert patched_item["times_worn"] == 3

    delete_response = client.delete(f"/collection/{item_id}", headers=headers)

    assert delete_response.status_code == 204

    after_delete_response = client.get(f"/collection/{item_id}", headers=headers)

    assert after_delete_response.status_code == 404
    assert after_delete_response.json()["error"]["type"] == "http_error"
    assert (
        after_delete_response.json()["error"]["message"] == "Collection item not found"
    )


def test_collection_list_filters_work(
    client,
    auth_headers,
    db_session,
):
    from app.models.brand import Brand
    from app.models.fragrance import Fragrance

    headers = auth_headers(email="owner@example.com", username="owneruser")

    brand_1 = Brand(name="Dior")
    brand_2 = Brand(name="Chanel")
    db_session.add_all([brand_1, brand_2])
    db_session.flush()

    fragrance_1 = Fragrance(
        brand_id=brand_1.id,
        name="Dior Homme Intense",
        release_year=2011,
        gender_category="masculine",
        description="Test fragrance 1",
    )
    fragrance_2 = Fragrance(
        brand_id=brand_2.id,
        name="Bleu de Chanel",
        release_year=2010,
        gender_category="masculine",
        description="Test fragrance 2",
    )
    db_session.add_all([fragrance_1, fragrance_2])
    db_session.commit()

    create_1 = client.post(
        "/collection/",
        json={
            "fragrance_id": fragrance_1.id,
            "ownership_type": "full_bottle",
            "personal_rating": 9,
        },
        headers=headers,
    )
    create_2 = client.post(
        "/collection/",
        json={
            "fragrance_id": fragrance_2.id,
            "ownership_type": "sample",
            "personal_rating": 6,
        },
        headers=headers,
    )

    assert create_1.status_code == 201
    assert create_2.status_code == 201

    brand_filter_response = client.get("/collection/?brand=Dior", headers=headers)
    assert brand_filter_response.status_code == 200
    brand_data = brand_filter_response.json()["data"]
    assert len(brand_data) == 1
    assert brand_data[0]["fragrance"]["brand"] == "Dior"

    ownership_filter_response = client.get(
        "/collection/?ownership_type=sample",
        headers=headers,
    )
    assert ownership_filter_response.status_code == 200
    ownership_data = ownership_filter_response.json()["data"]
    assert len(ownership_data) == 1
    assert ownership_data[0]["ownership_type"] == "sample"

    rating_filter_response = client.get(
        "/collection/?min_rating=8",
        headers=headers,
    )
    assert rating_filter_response.status_code == 200
    rating_data = rating_filter_response.json()["data"]
    assert len(rating_data) == 1
    assert rating_data[0]["personal_rating"] == 9
