import unittest

from .test_base import DataSourcesBaseTestCase


class TestCreateDataSource(DataSourcesBaseTestCase):
    def test_root(self) -> None:
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


if __name__ == "__main__":
    unittest.main()
