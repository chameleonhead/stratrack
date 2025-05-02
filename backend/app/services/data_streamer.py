from collections.abc import Iterator
from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.features.datasources.models import DataChunk


def stream_data_chunks(
    db: Session,
    data_source_id: UUID,
    start: datetime,
    end: datetime,
) -> Iterator[str]:
    chunks = (
        db.query(DataChunk)
        .filter(
            DataChunk.data_source_id == data_source_id,
            DataChunk.start_time <= end,
            DataChunk.end_time >= start,
        )
        .order_by(DataChunk.start_time)
        .all()
    )

    for chunk in chunks:
        yield chunk.data.decode()
