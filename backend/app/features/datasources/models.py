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
    symbol: Mapped[str] = mapped_column(
        String, nullable=False
    )  # 通貨ペアなど（例: EURUSD）
    timeframe: Mapped[Timeframe] = mapped_column(Enum(Timeframe), nullable=False)
    source_type: Mapped[DataSourceType] = mapped_column(
        Enum(DataSourceType), nullable=False
    )
    description: Mapped[str] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )

    data_chunks = relationship(
        "DataChunk", back_populates="data_source", cascade="all, delete-orphan"
    )
    import_histories = relationship(
        "ImportHistory", back_populates="data_source", cascade="all, delete-orphan"
    )


class ImportHistory(Base):
    __tablename__ = "import_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    data_source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_sources.id"), nullable=False
    )
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    status: Mapped[str] = mapped_column(
        String, default="success"
    )  # success / failed / partial
    message: Mapped[str] = mapped_column(
        String, nullable=True
    )  # 任意のコメントやエラーメッセージ

    data_source = relationship("DataSource", back_populates="import_histories")
    chunks = relationship(
        "DataChunk", back_populates="import_history", cascade="all, delete-orphan"
    )


class DataChunk(Base):
    __tablename__ = "data_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    data_source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("data_sources.id"), nullable=False
    )
    import_history_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("import_history.id"), nullable=False
    )

    start_at: Mapped[datetime]
    end_at: Mapped[datetime]
    container_name: Mapped[str]
    blob_name: Mapped[str]
    file_size: Mapped[int] = mapped_column(Integer)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)

    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    data_source = relationship("DataSource", back_populates="data_chunks")
    import_history = relationship("ImportHistory", back_populates="chunks")
