class TestRegisterEndpoint:
    def test_register_returns_201_with_public_user(self, client):
        resp = client.post("/api/auth/register", json={"email": "new@example.com", "password": "password123"})
        assert resp.status_code == 201
        body = resp.json()
        assert body["email"] == "new@example.com"
        assert "password" not in body
        assert "password_hash" not in body

    def test_register_duplicate_email_returns_409(self, client, make_user):
        make_user(email="taken@example.com")
        resp = client.post("/api/auth/register", json={"email": "taken@example.com", "password": "password123"})
        assert resp.status_code == 409

    def test_register_invalid_payload_returns_422(self, client):
        resp = client.post("/api/auth/register", json={"email": "not-an-email-but-fine", "password": "short"})
        assert resp.status_code == 422


class TestLoginEndpoint:
    def test_login_correct_credentials_returns_token(self, client, make_user):
        make_user(email="user@example.com", password="correct-password")
        resp = client.post("/api/auth/login", json={"email": "user@example.com", "password": "correct-password"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["token_type"] == "bearer"
        assert body["access_token"]

    def test_login_wrong_password_returns_401(self, client, make_user):
        make_user(email="user@example.com", password="correct-password")
        resp = client.post("/api/auth/login", json={"email": "user@example.com", "password": "wrong-password"})
        assert resp.status_code == 401

    def test_login_unknown_email_returns_401(self, client):
        resp = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "whatever123"})
        assert resp.status_code == 401


class TestMeEndpoint:
    def test_me_without_token_returns_401(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_me_with_invalid_token_returns_401(self, client):
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"})
        assert resp.status_code == 401

    def test_me_with_valid_token_returns_user(self, client, make_user, auth_headers):
        user = make_user(email="user@example.com")
        resp = client.get("/api/auth/me", headers=auth_headers(user.id))
        assert resp.status_code == 200
        assert resp.json()["email"] == "user@example.com"
