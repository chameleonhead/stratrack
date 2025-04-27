import base64
import uuid
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
    return [
        DataSourceRead(
            id=ds.id,
            symbol=ds.symbol,
            timeframe=ds.timeframe,
            sourceType=ds.source_type,
            description=ds.description,
            createdAt=ds.created_at,
        )
        for ds in db.query(DataSource).all()
    ]


@router.post("/data-sources", response_model=DataSourceRead, status_code=201)
def create_data_source(data: DataSourceCreate, db: Session = Depends(get_db)):
    ds = DataSource(
        name=data.name,
        symbol=data.symbol,
        timeframe=data.timeframe,
        source_type=data.sourceType,
        description=data.description,
    )
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return DataSourceRead(
        id=ds.id,
        symbol=ds.symbol,
        timeframe=ds.timeframe,
        sourceType=ds.source_type,
        description=ds.description,
        createdAt=ds.created_at,
    )


@router.get("/data-sources/{data_source_id}", response_model=DataSourceRead)
def get_data_source(data_source_id: UUID, db: Session = Depends(get_db)):
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")
    return DataSourceRead(
        id=ds.id,
        symbol=ds.symbol,
        timeframe=ds.timeframe,
        sourceType=ds.source_type,
        description=ds.description,
        createdAt=ds.created_at,
    )


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
    data_source_id: UUID,
    data: ImportRequest,
    db: Session = Depends(get_db),
    blob_client: BlobStorageClient = Depends(get_blob_client),
):
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")

    import_history = ImportHistory(
        data_source_id=data_source_id,
        message=data.message,
    )
    db.add(import_history)
    db.commit()
    db.refresh(import_history)

    for chunk_data in data.chunks:
        chunk_id = uuid.uuid4()
        container_name = str(ds.id)
        blob_name = f"{chunk_id}/{ds.name}_{ds.symbol}_{ds.timeframe}_{chunk_data.startAt.strftime('%Y%m%d%H%M%S')}_{chunk_data.endAt.strftime('%Y%m%d%H%M%S')}.csv"
        file_size = blob_client.upload_blob(
            container_name=container_name,
            blob_name=blob_name,
            data=base64.b64decode(chunk_data.data),
        )
        chunk = DataChunk(
            id=chunk_id,
            data_source_id=data_source_id,
            import_history_id=import_history.id,
            container_name=container_name,
            blob_name=blob_name,
            file_size=file_size,
            start_at=chunk_data.startAt,
            end_at=chunk_data.endAt,
        )
        db.add(chunk)

    db.commit()

    return ImportHistoryRead(
        id=import_history.id,
        dataSourceId=import_history.data_source_id,
        importedAt=import_history.imported_at,
        status=import_history.status,
        message=import_history.message,
    )


@router.get(
    "/data-sources/{data_source_id}/import-histories",
    response_model=list[ImportHistoryRead],
)
def list_import_histories(
    data_source_id: UUID,
    db: Session = Depends(get_db),
):
    return [
        ImportHistoryRead(
            id=import_history.id,
            dataSourceId=import_history.data_source_id,
            importedAt=import_history.imported_at,
            status=import_history.status,
            message=import_history.message,
        )
        for import_history in (
            db.query(ImportHistory)
            .filter(ImportHistory.data_source_id == data_source_id)
            .all()
        )
    ]


@router.get("/data-sources/{data_source_id}/chunks", response_model=list[DataChunkRead])
def list_data_chunks(
    data_source_id: UUID,
    start: datetime | None = None,
    end: datetime | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(DataChunk).filter(
        DataChunk.data_source_id == data_source_id,
        DataChunk.is_active.is_(True),
    )
    if start:
        query = query.filter(DataChunk.end_at >= start)
    if end:
        query = query.filter(DataChunk.start_at <= end)
    return [
        DataChunkRead(
            id=chunk.id,
            dataSourceId=chunk.data_source_id,
            importHistoryId=chunk.import_history_id,
            importedAt=chunk.imported_at,
            startAt=chunk.start_at,
            endAt=chunk.end_at,
            fileSize=chunk.file_size,
            isActive=chunk.is_active,
            priority=chunk.priority,
        )
        for chunk in query.order_by(DataChunk.priority.desc()).all()
    ]


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
    chunk_id: UUID,
    patch: DataChunkUpdate,
    db: Session = Depends(get_db),
):
    chunk = db.query(DataChunk).filter(DataChunk.id == chunk_id).first()
    if not chunk:
        raise HTTPException(status_code=404, detail="DataChunk not found")

    for key, value in patch.dict(exclude_unset=True).items():
        setattr(chunk, key, value)

    db.commit()
    db.refresh(chunk)
    return DataChunkRead(
        id=chunk.id,
        dataSourceId=chunk.data_source_id,
        importHistoryId=chunk.import_history_id,
        startAt=chunk.start_at,
        endAt=chunk.end_at,
        blobPath=chunk.blob_path,
        fileSize=chunk.file_size,
        isActive=chunk.is_active,
        priority=chunk.priority,
        importedAt=chunk.imported_at,
    )


app.include_router(router, prefix="/api", tags=["data"])
