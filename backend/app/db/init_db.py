import app.services.backtesting.models  # noqa: F401
import app.services.datasources.models  # noqa: F401
import app.services.strategies.models  # noqa: F401

from .base import Base
from .session import engine


def init_db():
    Base.metadata.create_all(bind=engine)
