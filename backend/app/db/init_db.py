from .session import engine
from .base import Base
import app.services.strategies.models  # noqa: F401

def init_db():
    Base.metadata.create_all(bind=engine)
