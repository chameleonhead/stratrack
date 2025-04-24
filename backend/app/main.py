from fastapi import FastAPI

from app.services.strategies.main import app as strategies_app

app = FastAPI(title="Unified API", docs_url=None, redoc_url=None)

app.mount("/strategies", strategies_app)
