from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DataSourceType(str, enum.Enum):
    DUKASCOPY = "dukas_copy"
    CUSTOM = "custom"
    OTHER = "other"


class Timeframe(str, enum.Enum):
    TICK = "tick"
    M1 = "1min"
    M5 = "5min"
    M15 = "15min"
    M30 = "30min"
    H1 = "1h"
    H4 = "4h"
    D1 = "1d"


class DataSource(Base):
    __tablename__ = "data_sources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    timeframe: Mapped[Timeframe] = mapped_column(Enum(Timeframe), nullable=False)
    source_type: Mapped[DataSourceType] = mapped_column(
        Enum(DataSourceType), nullable=False
    )
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )

    data_chunks: Mapped[list["DataChunk"]] = relationship(
        back_populates="data_source", cascade="all, delete-orphan"
    )
    upload_histories: Mapped[list["UploadHistory"]] = relationship(
        back_populates="data_source", cascade="all, delete-orphan"
    )


class UploadHistory(Base):
    __tablename__ = "upload_histories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    data_source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_sources.id"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String, nullable=False)
    source_type: Mapped[str] = mapped_column(String, nullable=False)
    timeframe: Mapped[str] = mapped_column(String, nullable=False)
    upload_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    message: Mapped[str | None] = mapped_column(String, nullable=True)

    data_source: Mapped["DataSource"] = relationship(back_populates="upload_histories")
    data_chunks: Mapped[list["DataChunk"]] = relationship(
        back_populates="upload_history", cascade="all, delete-orphan"
    )


class DataChunk(Base):
    __tablename__ = "data_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    data_source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_sources.id"), nullable=False
    )
    upload_history_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("upload_histories.id"), nullable=False
    )
    start_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    blob_url: Mapped[str] = mapped_column(String, nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    data_source: Mapped["DataSource"] = relationship(back_populates="data_chunks")
    upload_history: Mapped["UploadHistory"] = relationship(back_populates="data_chunks")
