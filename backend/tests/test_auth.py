def test_auth_flow(client):
    create_response = client.post(
        "/users/",
        json={
            "email": "jp@example.com",
            "username": "jpuser",
            "password": "test123456",
        },
    )

    assert create_response.status_code == 201
    created_user = create_response.json()["data"]
    assert created_user["email"] == "jp@example.com"
    assert created_user["username"] == "jpuser"
    assert created_user["is_active"] is True

    login_response = client.post(
        "/auth/login",
        data={
            "username": "jp@example.com",
            "password": "test123456",
        },
    )

    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"

    token = login_data["access_token"]

    me_response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    me_data = me_response.json()["data"]
    assert me_data["email"] == "jp@example.com"
    assert me_data["username"] == "jpuser"


def test_login_fails_with_wrong_password(client):
    client.post(
        "/users/",
        json={
            "email": "jp@example.com",
            "username": "jpuser",
            "password": "test123456",
        },
    )

    login_response = client.post(
        "/auth/login",
        data={
            "username": "jp@example.com",
            "password": "wrongpassword",
        },
    )

    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Invalid credentials"
