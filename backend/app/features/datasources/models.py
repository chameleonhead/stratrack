import enum
import uuid
from datetime import datetime, time

from sqlalchemy import Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import UUID as UUIDType
from sqlalchemy.types import (
    Boolean,
    DateTime,
    Float,
    Integer,
    LargeBinary,
    String,
    Time,
)

from app.db.base import Base


# Enum定義
class IntervalType(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class DataFormat(str, enum.Enum):
    tick = "tick"
    ohlc = "ohlc"


# データソース
class DataSource(Base):
    __tablename__ = "data_sources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUIDType(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    timeframe: Mapped[str] = mapped_column(String, nullable=False)
    source_type: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    chunks = relationship(
        "DataChunk", back_populates="data_source", cascade="all, delete-orphan"
    )
    schedules = relationship(
        "DataSourceSchedule", back_populates="data_source", cascade="all, delete-orphan"
    )
    upload_histories = relationship(
        "UploadHistory", back_populates="data_source", cascade="all, delete-orphan"
    )


# チャンクデータ
class DataChunk(Base):
    __tablename__ = "data_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUIDType(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    data_source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("data_sources.id"), nullable=False
    )
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    is_complete: Mapped[bool] = mapped_column(Boolean, default=True)
    completeness_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    format: Mapped[DataFormat] = mapped_column(Enum(DataFormat), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=True)
    data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)

    data_source = relationship("DataSource", back_populates="chunks")


# スケジュール設定
class DataSourceSchedule(Base):
    __tablename__ = "data_source_schedules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUIDType(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    data_source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("data_sources.id"), nullable=False
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    interval_type: Mapped[IntervalType] = mapped_column(
        Enum(IntervalType), nullable=False
    )
    run_at: Mapped[time] = mapped_column(Time, nullable=False)
    last_run_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    next_run_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    data_source = relationship("DataSource", back_populates="schedules")


# アップロード履歴
class UploadHistory(Base):
    __tablename__ = "upload_histories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUIDType(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    data_source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("data_sources.id"), nullable=False
    )
    uploaded_by: Mapped[str] = mapped_column(String, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    file_name: Mapped[str] = mapped_column(String, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)

    data_source = relationship("DataSource", back_populates="upload_histories")
