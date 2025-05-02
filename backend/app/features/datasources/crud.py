import base64
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from .models import DataChunk, DataFormat, DataSource, UploadHistory
from .schemas import DataChunkCreate, DataSourceCreate


def create_data_source(db: Session, data: DataSourceCreate) -> DataSource:
    ds = DataSource(
        name=data.name,
        symbol=data.symbol,
        timeframe=data.timeframe,
        source_type=data.sourceType,
        description=data.description,
        is_active=True,
    )
    db.add(ds)
    db.flush()
    db.refresh(ds)
    return ds


def create_upload_history(
    db: Session, data_source_id: str, message: str
) -> UploadHistory:
    history = UploadHistory(
        data_source_id=data_source_id,
        message=message,
    )
    db.add(history)
    db.flush()
    db.refresh(history)
    return history


def create_data_chunk(
    db: Session, data: DataChunkCreate, data_source_id: uuid.UUID
) -> DataChunk:
    byte_data = base64.b64decode(data.data.encode()).decode()
    chunk = DataChunk(
        data_source_id=data_source_id,
        start_at=data.startAt,
        end_at=data.endAt,
        version=1,
        is_complete=True,
        completeness_ratio=1,
        format=DataFormat.tick,
        data=byte_data,
    )
    db.add(chunk)
    db.flush()
    db.refresh(chunk)
    return chunk


def get_chunks_by_timerange(
    db: Session,
    data_source_id: str,
    start: datetime,
    end: datetime,
) -> list[DataChunk]:
    return (
        db.query(DataChunk)
        .filter(
            DataChunk.data_source_id == data_source_id,
            DataChunk.start_time <= end,
            DataChunk.end_time >= start,
            DataChunk.is_active.is_(True),
        )
        .order_by(DataChunk.start_time.desc())
        .all()
    )
