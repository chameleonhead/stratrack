import unittest
from fastapi.testclient import TestClient
from app.main import app
from uuid import uuid4
from datetime import datetime, timedelta

client = TestClient(app)

class TestDataSourceRoutes(unittest.TestCase):

    def setUp(self):
        self.symbol = "EURUSD"
        self.timeframe = "tick"
        self.source_type = "dukas_copy"
        self.description = "Test datasource"

    def test_create_and_get_data_source(self):
        response = client.post("/data-sources/data-sources", json={
            "symbol": self.symbol,
            "timeframe": self.timeframe,
            "source_type": self.source_type,
            "description": self.description
        })
        self.assertEqual(response.status_code, 201)
        data_source = response.json()
        data_source_id = data_source["id"]

        get_response = client.get(f"/data-sources/data-sources/{data_source_id}")
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.json()["symbol"], self.symbol)

    def test_list_data_sources(self):
        response = client.get("/data-sources/data-sources")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_import_data_chunks(self):
        # Create a data source first
        ds_resp = client.post("/data-sources/data-sources", json={
            "symbol": self.symbol,
            "timeframe": self.timeframe,
            "source_type": self.source_type,
            "description": self.description
        })
        self.assertEqual(ds_resp.status_code, 201)
        data_source_id = ds_resp.json()["id"]

        # Create import with one chunk
        start = datetime.now().isoformat()
        end = (datetime.now() + timedelta(hours=1)).isoformat()

        import_resp = client.post(f"/data-sources/data-sources/{data_source_id}/import", json={
            "status": "success",
            "message": "test import",
            "chunks": [
                {
                    "start_at": start,
                    "end_at": end,
                    "blob_path": "/blob/test.parquet",
                    "file_size": 1024
                }
            ]
        })
        self.assertEqual(import_resp.status_code, 201)
        import_history_id = import_resp.json()["id"]

        # List import histories
        list_resp = client.get(f"/data-sources/data-sources/{data_source_id}/import-histories")
        self.assertEqual(list_resp.status_code, 200)
        self.assertTrue(any(h["id"] == import_history_id for h in list_resp.json()))

        # List chunks
        chunk_resp = client.get(f"/data-sources/data-sources/{data_source_id}/chunks")
        self.assertEqual(chunk_resp.status_code, 200)
        self.assertTrue(len(chunk_resp.json()) >= 1)

if __name__ == "__main__":
    unittest.main()
