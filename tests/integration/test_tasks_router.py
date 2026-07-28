import pytest


@pytest.fixture()
def owner(make_user):
    return make_user(email="owner@example.com")


@pytest.fixture()
def headers(owner, auth_headers):
    return auth_headers(owner.id)


class TestListTasks:
    def test_requires_auth(self, client):
        resp = client.get("/api/tasks")
        assert resp.status_code == 401

    def test_returns_empty_list_when_no_tasks(self, client, headers):
        resp = client.get("/api/tasks", headers=headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_only_returns_own_tasks(self, client, headers, make_user, auth_headers):
        client.post("/api/tasks", json={"title": "mine"}, headers=headers)
        other = make_user(email="other@example.com")
        other_headers = auth_headers(other.id)
        client.post("/api/tasks", json={"title": "theirs"}, headers=other_headers)

        resp = client.get("/api/tasks", headers=headers)
        titles = [t["title"] for t in resp.json()]
        assert titles == ["mine"]


class TestCreateTask:
    def test_create_returns_201_with_task(self, client, headers):
        resp = client.post("/api/tasks", json={"title": "Write tests"}, headers=headers)
        assert resp.status_code == 201
        body = resp.json()
        assert body["title"] == "Write tests"
        assert body["status"] == "pending"

    def test_create_requires_auth(self, client):
        resp = client.post("/api/tasks", json={"title": "Write tests"})
        assert resp.status_code == 401

    def test_create_blank_title_returns_422(self, client, headers):
        resp = client.post("/api/tasks", json={"title": "   "}, headers=headers)
        assert resp.status_code == 422


class TestGetTask:
    def test_get_existing_task(self, client, headers):
        created = client.post("/api/tasks", json={"title": "Task"}, headers=headers).json()
        resp = client.get(f"/api/tasks/{created['id']}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == created["id"]

    def test_get_nonexistent_task_returns_404(self, client, headers):
        import uuid

        resp = client.get(f"/api/tasks/{uuid.uuid4()}", headers=headers)
        assert resp.status_code == 404

    def test_get_other_users_task_returns_404(self, client, headers, make_user, auth_headers):
        created = client.post("/api/tasks", json={"title": "Task"}, headers=headers).json()
        other = make_user(email="other2@example.com")
        other_headers = auth_headers(other.id)
        resp = client.get(f"/api/tasks/{created['id']}", headers=other_headers)
        assert resp.status_code == 404


class TestUpdateTask:
    def test_update_existing_task(self, client, headers):
        created = client.post("/api/tasks", json={"title": "Task"}, headers=headers).json()
        resp = client.patch(f"/api/tasks/{created['id']}", json={"title": "Updated"}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated"

    def test_update_nonexistent_task_returns_404(self, client, headers):
        import uuid

        resp = client.patch(f"/api/tasks/{uuid.uuid4()}", json={"title": "Updated"}, headers=headers)
        assert resp.status_code == 404


class TestDeleteTask:
    def test_delete_existing_task(self, client, headers):
        created = client.post("/api/tasks", json={"title": "Task"}, headers=headers).json()
        resp = client.delete(f"/api/tasks/{created['id']}", headers=headers)
        assert resp.status_code == 204

        follow_up = client.get(f"/api/tasks/{created['id']}", headers=headers)
        assert follow_up.status_code == 404

    def test_delete_nonexistent_task_returns_404(self, client, headers):
        import uuid

        resp = client.delete(f"/api/tasks/{uuid.uuid4()}", headers=headers)
        assert resp.status_code == 404
