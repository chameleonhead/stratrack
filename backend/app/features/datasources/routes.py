from datetime import datetime
from typing import Generator
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db

from . import crud
from .models import DataChunk, DataSource, DataSourceSchedule
from .schemas import (
    DataSourceCreate,
    DataSourceRead,
    DataSourceScheduleUpdateRequest,
)

router = APIRouter(tags=["DataSources"])


@router.get("/data-sources", response_model=list[DataSourceRead])
def list_data_sources(db: Session = Depends(get_db)) -> list[DataSourceRead]:
    return [
        DataSourceRead(
            id=ds.id,
            name=ds.name,
            symbol=ds.symbol,
            timeframe=ds.timeframe,
            sourceType=ds.source_type,
            description=ds.description,
        )
        for ds in db.query(DataSource).all()
    ]


@router.post("/data-sources", response_model=DataSourceRead, status_code=201)
def create_data_source(data: DataSourceCreate, db: Session = Depends(get_db)) -> DataSourceRead:
    ds = crud.create_data_source(db, data)
    db.commit()
    db.refresh(ds)
    return DataSourceRead(
        id=ds.id,
        name=ds.name,
        symbol=ds.symbol,
        timeframe=ds.timeframe,
        sourceType=ds.source_type,
        description=ds.description,
    )


@router.get("/data-sources/{data_source_id}", response_model=DataSourceRead)
def get_data_source(data_source_id: UUID, db: Session = Depends()) -> DataSourceRead:
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")
    return DataSourceRead(
        id=ds.id,
        name=ds.name,
        symbol=ds.symbol,
        timeframe=ds.timeframe,
        sourceType=ds.source_type,
        description=ds.description,
    )


@router.delete("/data-sources/{data_source_id}", status_code=204)
def delete_data_source(data_source_id: UUID, db: Session = Depends(get_db)) -> None:
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")
    db.delete(ds)
    db.commit()
    return


@router.put("/data-sources/{data_source_id}/schedule")
def update_data_source_schedule(
    data_source_id: UUID,
    req: DataSourceScheduleUpdateRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    data_source = db.get(DataSource, data_source_id)
    if not data_source:
        raise HTTPException(status_code=404, detail="DataSource not found")

    schedule = db.scalar(select(DataSourceSchedule).where(DataSourceSchedule.data_source_id == data_source_id))

    if not schedule:
        schedule = DataSourceSchedule(
            data_source_id=data_source_id,
            enabled=req.enabled,
            interval_type=req.interval_type,
            run_at=req.run_at,
        )
        db.add(schedule)
    else:
        schedule.enabled = req.enabled
        schedule.interval_type = req.interval_type
        schedule.run_at = req.run_at

    db.commit()
    return {"message": "Schedule updated successfully"}


@router.get("/data-sources/{data_source_id}/stream")
def stream_data(
    data_source_id: UUID,
    start: datetime,
    end: datetime,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    query = (
        db.query(DataChunk)
        .filter(
            DataChunk.data_source_id == data_source_id,
            DataChunk.is_active.is_(True),
        )
        .order_by(DataChunk.start_time)
    )
    if start:
        query = query.filter(DataChunk.end_time >= start)
    if end:
        query = query.filter(DataChunk.start_time <= end)

    def stream_data_chunks() -> Generator[bytes, None, None]:
        for chunk in query.all():
            yield chunk.data

    generator = stream_data_chunks()
    return StreamingResponse(generator, media_type="text/plain")
