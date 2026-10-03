# Test file for app.core.errors
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI, HTTPException, Request
from fastapi.testclient import TestClient
from pydantic import BaseModel
from slowapi.errors import RateLimitExceeded

from app.core.errors import _payload, _http_error_code_from_status, register_exception_handlers

class _Item(BaseModel):
    name: str

@pytest.fixture()
def test_exception_client():
    """
    TestClient for a minimal FastAPI app with routes to raise different exception types.
    """
    
    test_app = FastAPI()
    register_exception_handlers(test_app)
    
    @test_app.get("/http-404")
    def raise_http_404():
        raise HTTPException(status_code=404, detail="Task not found")
    
    @test_app.post("/validate")
    def validate(item: _Item):
        return item
    
    @test_app.get("/rate-limited")
    def raise_rate_limited(request: Request):
        request.state.request_id = "req-123"
        raise RateLimitExceeded(MagicMock(error_message="1 per minute"))

    @test_app.get("/unhandled")
    def raise_unhandled():
        raise RuntimeError("secret internal detail")

    return TestClient(test_app, raise_server_exceptions=False)


class TestExceptionHandlers:
    def test_http_exception_returns_404(self, test_exception_client):
        response = test_exception_client.get("/http-404")
        
        assert response.status_code == 404
        assert response.json() == {"error": "not_found", "message": "Task not found"}
    
    def test_validation_error_returns_422(self, test_exception_client):
        response = test_exception_client.post("/validate", json={})
        body = response.json()
        
        assert response.status_code == 422
        assert body["error"] == "validation_error"
        assert body["message"] == "Request validation failed"
        assert body["details"][0]["loc"] == ["body", "name"]
        
    
    def test_rate_limit_exception_returns_429(self, test_exception_client):
        response = test_exception_client.get("/rate-limited")
        body = response.json()
        
        assert response.status_code == 429
        assert body["error"] == "rate_limited"
        assert body["message"] == "Too many requests"
        assert body["details"] == {"retry_after": None}
        assert body["request_id"] == "req-123"
    
    def test_unhandled_exception_returns_500(self, test_exception_client):
        response = test_exception_client.get("/unhandled")
        body = response.json()
        
        assert response.status_code == 500
        assert body == {
            "error": "internal_error",
            "message": "Internal server error"
        }
        assert "secret internal detail" not in response.text
    

class TestErrorPayload:
    def test_payload_with_only_error_and_message(self):
        """
        Tests the _payload method from app/core/errors.py.
        """

        result = _payload("error_code", "An error occurred")
        
        assert result == {"error": "error_code", "message": "An error occurred"}
    
    def test_payload_with_details(self):
        """
        Tests the _payload method from app/core/errors.py with details optional argument.
        """
        
        result = _payload("error_code", "An error occurred", details="Extra additional error context")
        
        assert result == {"error": "error_code", "message": "An error occurred", "details": "Extra additional error context"}

    def test_payload_with_request_id(self):
        """
        Tests the _payload method from app/core/errors.py with request_id optional argument.
        """
        
        result = _payload("error_code", "An error occurred", request_id="123456789")
        
        assert result == {"error": "error_code", "message": "An error occurred", "request_id": "123456789"}

class TestHTTPErrorCodeMapping:
    def test_http_error_code_from_status(self):
        """
        Tests the _http_error_code_from_status method from app/core/errors.py
        """

        assert _http_error_code_from_status(400) == "bad_request"
        assert _http_error_code_from_status(401) == "unauthorized"
        assert _http_error_code_from_status(403) == "forbidden"
        assert _http_error_code_from_status(404) == "not_found"
        assert _http_error_code_from_status(409) == "conflict"
        assert _http_error_code_from_status(422) == "validation_error"
        assert _http_error_code_from_status(500) == "internal_error"



        
        
        
        
        