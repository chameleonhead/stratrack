from __future__ import annotations

from fastapi import FastAPI, Path

from .schemas import (
    StrategyCreateRequest,
    StrategyDetail,
    StrategySummary,
    StrategyVersionCreateRequest,
    StrategyVersionDetail,
    StrategyVersionSummary,
)

app = FastAPI(
    title="Stratrack Strategies API",
    version="0.1.0",
    description="API for managing strategies",
    docs_url="/docs",
)


@app.get("/strategies", response_model=list[StrategySummary])
def get_strategies() -> list[StrategySummary]:
    """
    Get a list of strategies
    """
    pass


@app.post(
    "/strategies", response_model=None, responses={"201": {"model": StrategyDetail}}
)
def post_strategies(body: StrategyCreateRequest) -> StrategyDetail | None:
    """
    Create a new strategy
    """
    pass


@app.get("/strategies/{strategyId}", response_model=StrategyDetail)
def get_strategies_strategy_id(
    strategy_id: str = Path(..., alias="strategyId")
) -> StrategyDetail:
    """
    Get detailed information about a strategy
    """
    pass


@app.get(
    "/strategies/{strategyId}/versions", response_model=list[StrategyVersionSummary]
)
def get_strategies_strategy_id_versions(
    strategy_id: str = Path(..., alias="strategyId")
) -> list[StrategyVersionSummary]:
    """
    List all versions of a strategy
    """
    pass


@app.post(
    "/strategies/{strategyId}/versions",
    response_model=None,
    responses={"201": {"model": StrategyVersionDetail}},
)
def post_strategies_strategy_id_versions(
    strategy_id: str = Path(..., alias="strategyId"),
    body: StrategyVersionCreateRequest = ...,
) -> StrategyVersionDetail | None:
    """
    Add a new version to a strategy
    """
    pass
