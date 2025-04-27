from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.data_streamer import stream_data_chunks
from app.services.storage import BlobStorageClient, get_blob_client

from .models import DataChunk, DataSource, ImportHistory
from .schemas import (
    DataChunkRead,
    DataChunkUpdate,
    DataSourceCreate,
    DataSourceRead,
    ImportHistoryRead,
    ImportRequest,
)

app = FastAPI()
router = APIRouter()


@router.get("/data-sources", response_model=list[DataSourceRead])
def list_data_sources(db: Session = Depends(get_db)):
    return db.query(DataSource).all()


@router.post("/data-sources", response_model=DataSourceRead, status_code=201)
def create_data_source(data: DataSourceCreate, db: Session = Depends(get_db)):
    ds = DataSource(**data.dict())
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return ds


@router.get("/data-sources/{data_source_id}", response_model=DataSourceRead)
def get_data_source(data_source_id: UUID, db: Session = Depends(get_db)):
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")
    return ds


@router.delete("/data-sources/{data_source_id}", status_code=204)
def delete_data_source(data_source_id: UUID, db: Session = Depends(get_db)):
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")
    db.delete(ds)
    db.commit()
    return


@router.post(
    "/data-sources/{data_source_id}/import",
    response_model=ImportHistoryRead,
    status_code=201,
)
def import_data(
    data_source_id: UUID, data: ImportRequest, db: Session = Depends(get_db)
):
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")

    import_history = ImportHistory(
        data_source_id=data_source_id, status=data.status, message=data.message
    )
    db.add(import_history)
    db.commit()
    db.refresh(import_history)

    for chunk_data in data.chunks:
        chunk = DataChunk(
            data_source_id=data_source_id,
            import_history_id=import_history.id,
            **chunk_data.dict(),
        )
        db.add(chunk)
    db.commit()

    return import_history


@router.get(
    "/data-sources/{data_source_id}/import-histories",
    response_model=list[ImportHistoryRead],
)
def list_import_histories(data_source_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(ImportHistory)
        .filter(ImportHistory.data_source_id == data_source_id)
        .all()
    )


@router.get("/data-sources/{data_source_id}/chunks", response_model=list[DataChunkRead])
def list_data_chunks(
    data_source_id: UUID,
    start: datetime | None = None,
    end: datetime | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(DataChunk).filter(
        DataChunk.data_source_id == data_source_id, DataChunk.is_active.is_(True)
    )
    if start:
        query = query.filter(DataChunk.end_at >= start)
    if end:
        query = query.filter(DataChunk.start_at <= end)
    return query.order_by(DataChunk.priority.desc()).all()


@router.get("/data-sources/{data_source_id}/stream")
def stream_data(
    data_source_id: UUID,
    start: datetime,
    end: datetime,
    db: Session = Depends(get_db),
    blob_client: BlobStorageClient = Depends(get_blob_client),
):
    generator = stream_data_chunks(db, data_source_id, start, end, blob_client)
    return StreamingResponse(generator, media_type="text/plain")


@router.patch("/data-chunks/{chunk_id}", response_model=DataChunkRead)
def update_data_chunk(
    chunk_id: UUID, patch: DataChunkUpdate, db: Session = Depends(get_db)
):
    chunk = db.query(DataChunk).filter(DataChunk.id == chunk_id).first()
    if not chunk:
        raise HTTPException(status_code=404, detail="DataChunk not found")

    for key, value in patch.dict(exclude_unset=True).items():
        setattr(chunk, key, value)

    db.commit()
    db.refresh(chunk)
    return chunk


app.include_router(router, prefix="/api", tags=["data"])
