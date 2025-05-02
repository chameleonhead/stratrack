import unittest

from .test_base import DataSourcesBaseTestCase


class TestCreateDataSource(DataSourcesBaseTestCase):
    def test_creating_datasource(self) -> None:
        response = self.client.post(
            "/data-sources/data-sources",
            json={
                "name": "Test Data Source",
                "symbol": "USDJPY",
                "sourceType": "dukascopy",
                "timeframe": "tick",
                "description": None,
            },
        )
        assert response.status_code == 201
        assert response.json()["name"] == "Test Data Source"
        assert response.json()["symbol"] == "USDJPY"
        assert response.json()["sourceType"] == "dukascopy"
        assert response.json()["timeframe"] == "tick"
        assert response.json()["description"] is None

        list_response = self.client.get(
            "/data-sources/data-sources",
        )
        assert list_response.status_code == 200
        assert len(list_response.json()) == 1
        assert list_response.json()[0]["id"] == response.json()["id"]

    def test_register_datasource_update_schedule(self) -> None:
        response = self.client.post(
            "/data-sources/data-sources",
            json={
                "name": "Test Data Source",
                "symbol": "USDJPY",
                "sourceType": "dukascopy",
                "timeframe": "tick",
                "description": None,
            },
        )
        assert response.status_code == 201
        data_source_id = response.json()["id"]

        update_schedule_response = self.client.put(
            f"/data-sources/data-sources/{data_source_id}/schedule",
            json={
                "enabled": True,
                "interval_type": "daily",
                "run_at": "04:00",
            },
        )
        assert update_schedule_response.status_code == 200


if __name__ == "__main__":
    unittest.main()
