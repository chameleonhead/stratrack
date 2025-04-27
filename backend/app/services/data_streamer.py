from datetime import datetime
from typing import Iterator
from uuid import UUID
from app.features.datasources.models import DataChunk
from app.services.storage import BlobStorageClient
from sqlalchemy.orm import Session


def stream_data_chunks(
    db: Session,
    data_source_id: UUID,
    start: datetime,
    end: datetime,
    blob_client: BlobStorageClient,
) -> Iterator[str]:
    chunks = (
        db.query(DataChunk)
        .filter(
            DataChunk.data_source_id == data_source_id,
            DataChunk.start_at <= end,
            DataChunk.end_at >= start,
            DataChunk.is_active == True,
        )
        .order_by(DataChunk.start_at)
        .all()
    )

    for chunk in chunks:
        content = blob_client.read_blob(chunk.blob_path)
        yield content
