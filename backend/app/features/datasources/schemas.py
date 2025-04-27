from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DataSourceCreate(BaseModel):
    name: str
    symbol: str
    timeframe: str
    sourceType: str
    description: str | None = None


class DataSourceRead(BaseModel):
    id: UUID
    symbol: str
    timeframe: str
    sourceType: str
    description: str | None
    createdAt: datetime


class ImportHistoryRead(BaseModel):
    id: UUID
    dataSourceId: UUID
    importedAt: datetime
    status: str
    message: str | None


class DataChunkCreate(BaseModel):
    startAt: datetime
    endAt: datetime
    data: str


class ImportRequest(BaseModel):
    message: str | None = None
    chunks: list[DataChunkCreate]


class DataChunkRead(BaseModel):
    id: UUID
    dataSourceId: UUID
    importHistoryId: UUID
    startAt: datetime
    endAt: datetime
    fileSize: int
    isActive: bool
    priority: int
    importedAt: datetime


class DataChunkUpdate(BaseModel):
    isActive: bool | None = None
    priority: int | None = None
