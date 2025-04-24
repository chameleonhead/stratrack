from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.init_db import init_db
from app.services.backtesting.main import app as backtesting_app
from app.services.datasources.main import app as datasources_app
from app.services.strategies.main import app as strategies_app


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.mount("/strategies", strategies_app)
app.mount("/data-sources", datasources_app)
app.mount("/backtesting", backtesting_app)
