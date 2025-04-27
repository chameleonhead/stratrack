from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class StrategySummary(BaseModel):
    id: uuid.UUID
    name: str
    latestVersion: int
    latestVersionId: uuid.UUID
    createdAt: datetime
    updatedAt: datetime


class StrategyCreateRequest(BaseModel):
    name: str
    description: str | None = None
    tags: list[str]
    template: dict[str, Any]
    genereatedCode: str | None = None


class StrategyDetail(StrategySummary):
    description: str | None = None
    tags: list[str]
    template: dict[str, Any]
    genereatedCode: str | None = None


class StrategyVersionSummary(BaseModel):
    id: uuid.UUID
    version: int
    createdAt: datetime
    message: str | None = None


class StrategyVersionCreateRequest(BaseModel):
    message: str | None = None
    template: dict[str, Any]
    genereatedCode: str | None = None


class StrategyVersionDetail(StrategyVersionSummary):
    template: dict[str, Any]
