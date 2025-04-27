import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.strategies import crud


class TestCrudStrategy(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            echo=True,
        )
        cls.SessionLocal = sessionmaker(
            bind=cls.engine,
        )
        Base.metadata.create_all(bind=cls.engine)

    def setUp(self):
        self.db = self.SessionLocal()

    def tearDown(self):
        self.db.rollback()
        self.db.close()

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=cls.engine)
        cls.engine.dispose()

    def test_create_and_get_strategy(self):
        strategy = crud.create_strategy(
            name="UnitTest Strategy",
            description="desc",
            tag_names=["tagA", "tagB"],
            db=self.db,
        )
        self.db.commit()

        fetched = crud.get_strategy_by_id(strategy.id, self.db)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.name, "UnitTest Strategy")
        self.assertEqual(len(fetched.tags), 2)


if __name__ == "__main__":
    unittest.main()
