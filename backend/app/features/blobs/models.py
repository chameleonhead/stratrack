from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Blob(Base):
    __tablename__ = "blobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    container_name: Mapped[str] = mapped_column(String, nullable=False)
    blob_name: Mapped[str] = mapped_column(String, nullable=False)
    blob_path: Mapped[str] = mapped_column(String, nullable=False)
    meta_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )
    deleted: Mapped[bool] = mapped_column(Boolean, default=False)
