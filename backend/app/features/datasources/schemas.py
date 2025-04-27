from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

# ---------- DataSource ----------


class DataSourceCreate(BaseModel):
    name: str
    symbol: str
    timeframe: str
    source_type: str
    description: str | None = None


class DataSourceRead(BaseModel):
    id: UUID
    symbol: str
    timeframe: str
    source_type: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- ImportHistory ----------


class ImportHistoryRead(BaseModel):
    id: UUID
    data_source_id: UUID
    imported_at: datetime
    status: str
    message: str | None

    class Config:
        from_attributes = True


class DataChunkCreate(BaseModel):
    start_at: datetime
    end_at: datetime
    blob_path: str
    file_size: int
    priority: int = 0
    is_active: bool = True


class ImportRequest(BaseModel):
    status: str = "success"
    message: str | None = None
    chunks: list[DataChunkCreate]


# ---------- DataChunk ----------


class DataChunkRead(BaseModel):
    id: UUID
    data_source_id: UUID
    import_history_id: UUID
    start_at: datetime
    end_at: datetime
    blob_path: str
    file_size: int
    is_active: bool
    priority: int
    imported_at: datetime

    class Config:
        from_attributes = True


class DataChunkUpdate(BaseModel):
    is_active: bool | None = None
    priority: int | None = None
