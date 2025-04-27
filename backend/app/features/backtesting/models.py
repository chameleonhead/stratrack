import enum
import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class BacktestStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    success = "success"
    failed = "failed"


class BacktestRun(Base):
    __tablename__ = "backtest_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_version_id = Column(UUID(as_uuid=True), nullable=False)

    status = Column(
        Enum(BacktestStatus), default=BacktestStatus.pending, nullable=False
    )
    started_at = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)

    # 💡 バックテスト条件
    parameters = Column(JSON, nullable=True)
    data_source_id = Column(UUID(as_uuid=True), nullable=False)
    timeframe = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    # 結果
    result_summary = Column(JSON, nullable=True)
    log = Column(JSON, nullable=True)
    chart_data = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
