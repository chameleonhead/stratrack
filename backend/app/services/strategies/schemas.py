from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class StrategySummary(BaseModel):
    id: str | None = None
    name: str | None = None
    latestVersion: int | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None


class StrategyCreateRequest(BaseModel):
    name: str
    description: str | None = None
    tags: list[str | None] = None
    template: dict[str, Any]


class StrategyDetail(StrategySummary):
    description: str | None = None
    tags: list[str] = None


class StrategyVersionSummary(BaseModel):
    id: str | None = None
    version: int | None = None
    createdAt: datetime | None = None
    message: str | None = None


class StrategyVersionCreateRequest(BaseModel):
    message: str | None = None
    template: dict[str, Any]


class StrategyVersionDetail(StrategyVersionSummary):
    template: dict[str, Any | None] = None
