from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.services.strategies.models import StrategyVersion

from .models import BacktestRun
from .schemas import BacktestRequest, BacktestStatus


def create_backtest_run(request_data: BacktestRequest, db: Session) -> BacktestRun:
    strategy_version = (
        db.query(StrategyVersion)
        .filter(StrategyVersion.id == request_data.strategyVersionId)
        .first()
    )
    if not strategy_version:
        raise ValueError("Strategy version not found")

    bt = BacktestRun(
        strategy_version_id=request_data.strategyVersionId,
        status=BacktestStatus.pending,
        started_at=datetime.now(),
        # 入力された条件
        parameters=request_data.parameters,
        data_source_id=request_data.dataSourceId,
        timeframe=request_data.timeframe,
        start_time=request_data.startTime,
        end_time=request_data.endTime,
    )

    db.add(bt)
    db.commit()
    db.refresh(bt)

    # 非同期処理を実行するならここでキューに追加する処理（Celery / Azure Queue など）
    # enqueue_backtest_run(bt.id)

    return bt


def get_backtest_run(backtest_id: UUID, db: Session) -> BacktestRun | None:
    return db.query(BacktestRun).filter(BacktestRun.id == backtest_id).first()


def get_backtest_status(backtest_id: UUID, db: Session):
    bt = db.query(BacktestRun).filter(BacktestRun.id == backtest_id).first()
    if not bt:
        return None
    return {
        "id": bt.id,
        "status": bt.status,
    }


def update_backtest_result(
    backtest_id: UUID,
    db: Session,
    status: BacktestStatus,
    result_summary: dict | None = None,
    log: list[dict] | None = None,
    chart_data: list[dict] | None = None,
    error_message: str | None = None,
) -> BacktestRun | None:
    bt = db.query(BacktestRun).filter(BacktestRun.id == backtest_id).first()
    if not bt:
        return None

    bt.status = status
    bt.completed_at = datetime.now()
    bt.result_summary = result_summary
    bt.log = log
    bt.chart_data = chart_data
    bt.error_message = error_message

    db.commit()
    db.refresh(bt)
    return bt
