import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel


class BacktestStatus(str, Enum):
    pending = "pending"
    running = "running"
    success = "success"
    failed = "failed"


class BacktestRequest(BaseModel):
    strategyVersionId: uuid.UUID
    parameters: dict | None = None
    dataSourceId: uuid.UUID
    timeframe: str
    startTime: datetime
    endTime: datetime


class BacktestStatusResponse(BaseModel):
    id: uuid.UUID
    status: BacktestStatus


class BacktestRunResponse(BaseModel):
    id: uuid.UUID
    strategyVersionId: uuid.UUID
    status: BacktestStatus
    startedAt: datetime
    completedAt: datetime | None
    errorMessage: str | None
    parameters: dict | None
    dataSourceId: uuid.UUID
    timeframe: str
    startTime: datetime
    endTime: datetime
    resultSummary: Any | None
    log: Any | None
    chartData: Any | None
