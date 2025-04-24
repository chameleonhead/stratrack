from __future__ import annotations

from datetime import datetime
from typing import Any
import uuid

from pydantic import BaseModel, field_serializer


class StrategySummary(BaseModel):
    id: uuid.UUID
    name: str
    latestVersion: int
    createdAt: datetime
    updatedAt: datetime


class StrategyCreateRequest(BaseModel):
    name: str
    description: str | None = None
    tags: list[str] = None
    template: dict[str, Any]


class StrategyDetail(StrategySummary):
    description: str | None = None
    tags: list[str] = None
    template: dict[str, Any | None]


class StrategyVersionSummary(BaseModel):
    id: uuid.UUID
    version: int
    createdAt: datetime
    message: str | None = None


class StrategyVersionCreateRequest(BaseModel):
    message: str | None = None
    template: dict[str, Any]


class StrategyVersionDetail(StrategyVersionSummary):
    template: dict[str, Any | None] = None
