from sqlalchemy.orm import Session

from .models import DataChunk, ImportHistory
from .schemas import DataChunkCreate, ImportHistoryCreate


def create_import_history(db: Session, data: ImportHistoryCreate) -> ImportHistory:
    history = ImportHistory(**data.dict())
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


def create_data_chunk(db: Session, data: DataChunkCreate) -> DataChunk:
    chunk = DataChunk(**data.dict())
    db.add(chunk)
    db.commit()
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
