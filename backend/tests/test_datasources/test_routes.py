import unittest
from uuid import uuid4

from backend import app
from fastapi.testclient import TestClient


class TestDataSourceAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_create_data_source_success(self):
        response = self.client.post(
            "/data-sources",
            json={
                "name": "DukasCopy EURUSD",
                "symbol": "EURUSD",
                "timeframe": "1m",
                "source_type": "dukascopy",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "DukasCopy EURUSD")
        self.assertEqual(data["symbol"], "EURUSD")
        self.assertEqual(data["timeframe"], "1m")
        self.assertEqual(data["source_type"], "dukascopy")
        self.assertTrue(data["is_active"])

    def test_create_data_source_invalid_timeframe(self):
        response = self.client.post(
            "/data-sources",
            json={
                "name": "Bad Source",
                "symbol": "USDJPY",
                "timeframe": "3m",  # 不正
                "source_type": "mt4",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid timeframe", response.text)

    def test_list_data_sources_empty(self):
        response = self.client.get("/data-sources")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_get_data_source_success(self):
        dummy_id = str(uuid4())
        response = self.client.get(f"/data-sources/{dummy_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], dummy_id)
        self.assertEqual(data["symbol"], "EURUSD")
        self.assertEqual(data["timeframe"], "1m")


if __name__ == "__main__":
    unittest.main()
