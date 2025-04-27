import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    UUID,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.base import Base

strategy_tags = Table(
    "strategy_tags",
    Base.metadata,
    Column(
        "strategy_id", UUID(as_uuid=True), ForeignKey("strategies.id"), primary_key=True
    ),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

    strategies = relationship(
        "Strategy",
        secondary=strategy_tags,
        back_populates="tags",
    )


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

    tags = relationship("Tag", secondary=strategy_tags, back_populates="strategies")


class StrategyVersion(Base):
    __tablename__ = "strategy_versions"
    __table_args__ = (
        UniqueConstraint("strategy_id", "version_number", name="uix_strategy_version"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(
        UUID(as_uuid=True), ForeignKey("strategies.id"), nullable=False
    )
    version_number = Column(Integer, nullable=False)
    template_json = Column(JSON, nullable=False)
    generated_code = Column(Text)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.now)

    strategy = relationship("Strategy", back_populates="versions")
