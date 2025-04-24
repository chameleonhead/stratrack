from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from . import crud
from .schemas import (
    BacktestRunResponse,
    BacktestRequest,
    BacktestStatusResponse,
)

router = APIRouter(prefix="/backtests", tags=["Backtests"])


@router.post("/", response_model=BacktestRunResponse)
def create_backtest(request: BacktestRequest, db: Session = Depends(get_db)):
    """
    バックテストを新規作成（非同期実行をトリガー）
    """
    return crud.create_backtest_run(request.strategyVersionId, db)


@router.get("/{backtest_id}", response_model=BacktestRunResponse)
def get_backtest(backtest_id: UUID, db: Session = Depends(get_db)):
    """
    バックテストの詳細を取得
    """
    bt = crud.get_backtest_run(backtest_id, db)
    if not bt:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return bt


@router.get("/{backtest_id}/status", response_model=BacktestStatusResponse)
def get_backtest_status(backtest_id: UUID, db: Session = Depends(get_db)):
    """
    バックテストの実行状態を取得
    """
    return crud.get_backtest_status(backtest_id, db)
