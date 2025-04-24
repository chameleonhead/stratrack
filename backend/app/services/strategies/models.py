import uuid
from datetime import datetime

from sqlalchemy import JSON, UUID, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Column, relationship

from app.db.base import Base


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True)  # 認証実装時に利用
    name = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    deleted = Column(Boolean, default=False)

    versions = relationship("StrategyVersion", back_populates="strategy")


class StrategyVersion(Base):
    __tablename__ = "strategy_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(
        UUID(as_uuid=True), ForeignKey("strategies.id"), nullable=False
    )
    version_number = Column(Integer, nullable=False)
    template_json = Column(JSON, nullable=False)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utc)

    strategy = relationship("Strategy", back_populates="versions")
