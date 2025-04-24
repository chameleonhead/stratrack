import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel


class BacktestStatus(str, Enum):
    pending = "pending"
    running = "running"
    success = "success"
    failed = "failed"


class BacktestRequest(BaseModel):
    strategyVersionId: uuid.UUID
    parameters: Optional[dict] = None
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
    completedAt: Optional[datetime]
    errorMessage: Optional[str]
    parameters: Optional[dict]
    dataSourceId: uuid.UUID
    timeframe: str
    startTime: datetime
    endTime: datetime
    resultSummary: Optional[Any]
    log: Optional[Any]
    chartData: Optional[Any]
