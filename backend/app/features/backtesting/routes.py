from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db

from . import crud
from .schemas import (
    BacktestRequest,
    BacktestRunResponse,
    BacktestStatusResponse,
)

router = APIRouter(prefix="/backtests", tags=["Backtests"])


@router.post("/", response_model=BacktestRunResponse)
def create_backtest(request: BacktestRequest, db: Session = Depends(get_db)):
    """
    バックテストを新規作成（非同期実行をトリガー）
    """
    bt = crud.create_backtest_run(request, db)
    return BacktestRunResponse(
        id=bt.id,
        strategyVersionId=bt.strategy_version_id,
        status=bt.status,
        startedAt=bt.started_at,
        completedAt=bt.completed_at,
        errorMessage=bt.error_message,
        parameters=bt.parameters,
        dataSourceId=bt.data_source_id,
        timeframe=bt.timeframe,
        startTime=bt.start_time,
        endTime=bt.end_time,
        resultSummary=bt.result_summary,
        log=bt.log,
        chartData=bt.chart_data,
    )


@router.get("/{backtest_id}", response_model=BacktestRunResponse)
def get_backtest(backtest_id: UUID, db: Session = Depends(get_db)):
    """
    バックテストの詳細を取得
    """
    bt = crud.get_backtest_run(backtest_id, db)
    if not bt:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return BacktestRunResponse(
        id=bt.id,
        strategyVersionId=bt.strategy_version_id,
        status=bt.status,
        startedAt=bt.started_at,
        completedAt=bt.completed_at,
        errorMessage=bt.error_message,
        parameters=bt.parameters,
        dataSourceId=bt.data_source_id,
        timeframe=bt.timeframe,
        startTime=bt.start_time,
        endTime=bt.end_time,
        resultSummary=bt.result_summary,
        log=bt.log,
        chartData=bt.chart_data,
    )


@router.get("/{backtest_id}/status", response_model=BacktestStatusResponse)
def get_backtest_status(backtest_id: UUID, db: Session = Depends(get_db)):
    """
    バックテストの実行状態を取得
    """
    bts = crud.get_backtest_status(backtest_id, db)
    if not bts:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return BacktestStatusResponse(
        id=bts["id"],
        status=bts["status"],
    )
