# tests/features/datasources/test_base.py

import unittest
from collections.abc import Generator

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base
from app.db.session import get_db
from app.features.datasources.main import app as datasources_app


class DataSourcesBaseTestCase(unittest.TestCase):
    client: TestClient

    @classmethod
    def setUpClass(cls) -> None:
        # インメモリSQLiteのセットアップ
        engine = create_engine(
            "sqlite+pysqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        TestingSessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

        # テーブル作成
        Base.metadata.create_all(bind=engine)

        # DBオーバーライド関数
        def override_get_db() -> Generator[Session, None, None]:
            db = TestingSessionLocal()
            try:
                yield db
            finally:
                db.close()

        # テスト用FastAPIアプリ作成
        testapp = FastAPI()

        # datasourcesサブアプリにオーバーライド適用
        datasources_app.dependency_overrides[get_db] = override_get_db

        # マウント
        testapp.mount("/data-sources", datasources_app)

        cls.client = TestClient(testapp)
