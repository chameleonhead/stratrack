import unittest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestMain(unittest.TestCase):
    def test_root(self) -> None:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Hello World"}
