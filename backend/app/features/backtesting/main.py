from __future__ import annotations

from fastapi import FastAPI

from .routes import router

app = FastAPI(
    title="Stratrack Backtesting API",
    version="0.1.0",
    description="API for managing backtest runs",
    docs_url="/docs",
)
app.include_router(router)
