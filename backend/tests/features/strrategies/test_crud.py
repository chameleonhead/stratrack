from typing import Any
import unittest

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.strategies import crud


class TestCrudStrategy(unittest.TestCase):
    engine: Engine
    SessionLocal: Any

    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
        )
        cls.SessionLocal = sessionmaker(
            bind=cls.engine,
        )
        Base.metadata.create_all(bind=cls.engine)

    def setUp(self) -> None:
        self.db = self.SessionLocal()

    def tearDown(self) -> None:
        self.db.rollback()
        self.db.close()

    @classmethod
    def tearDownClass(cls) -> None:
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()

    def test_create_and_get_strategy(self) -> None:
        strategy = crud.create_strategy(
            name="UnitTest Strategy",
            description="desc",
            tag_names=["tagA", "tagB"],
            db=self.db,
        )
        self.db.commit()

        fetched = crud.get_strategy_by_id(strategy.id, self.db)
        if not fetched:
            raise Exception()
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.name, "UnitTest Strategy")
        self.assertEqual(len(fetched.tags), 2)


if __name__ == "__main__":
    unittest.main()
