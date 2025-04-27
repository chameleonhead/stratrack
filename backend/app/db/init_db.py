import app.features.backtesting.models  # noqa: F401
import app.features.datasources.models  # noqa: F401
import app.features.strategies.models  # noqa: F401

from .base import Base
from .session import engine


def init_db():
    Base.metadata.create_all(bind=engine)
