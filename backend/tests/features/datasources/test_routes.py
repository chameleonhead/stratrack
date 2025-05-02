import unittest

from .test_base import DataSourcesBaseTestCase


class TestCreateDataSource(DataSourcesBaseTestCase):
    def test_creating_datasource(self) -> None:
        response = self.client.post(
            "/data-sources/data-sources",
            json={
                "name": "Test Data Source",
                "symbol": "USDJPY",
                "sourceType": "dukascopi",
                "timeframe": "tick",
                "description": None,
            },
        )
        assert response.status_code == 201
        assert response.json()["name"] == "Test Data Source"
        assert response.json()["symbol"] == "USDJPY"
        assert response.json()["sourceType"] == "dukascopi"
        assert response.json()["timeframe"] == "tick"
        assert response.json()["description"] is None
        
        list_response = self.client.get(
            f"/data-sources/data-sources",
        )
        assert list_response.status_code == 200
        assert len(list_response.json()) == 1
        assert list_response.json()[0]["id"] == response.json()["id"]


if __name__ == "__main__":
    unittest.main()
