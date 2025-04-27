from sqlalchemy.orm import Session

from .models import DataChunk, DataSource, UploadHistory
from .schemas import DataChunkCreate, DataSourceCreate


def create_data_source(db: Session, data: DataSourceCreate) -> DataSource:
    ds = DataSource(
        name=data.name,
        symbol=data.symbol,
        timeframe=data.timeframe,
        source_type=data.sourceType,
        description=data.description,
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


def create_data_chunk(db: Session, data: DataChunkCreate) -> DataChunk:
    chunk = DataChunk(
        start_at=data.startAt,
        end_at=data.endAt,
        blob_path=data.blobPath,
        file_size=data.fileSize,
    )
    db.add(chunk)
    db.flush()
    db.refresh(chunk)
    return chunk


def get_chunks_by_timerange(db: Session, data_source_id, start, end) -> list[DataChunk]:
    return (
        db.query(DataChunk)
        .filter(
            DataChunk.data_source_id == data_source_id,
            DataChunk.start_at <= end,
            DataChunk.end_at >= start,
            DataChunk.is_active.is_(True),
        )
        .order_by(DataChunk.priority.desc())
        .all()
    )
