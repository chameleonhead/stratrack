from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.session import get_db
from .models import Strategy, StrategyVersion, Tag
from .schemas import (
    StrategySummary,
    StrategyCreateRequest,
    StrategyDetail,
    StrategyVersionSummary,
    StrategyVersionCreateRequest,
    StrategyVersionDetail,
)

router = APIRouter(prefix="/strategies", tags=["Strategies"])


def get_or_create_tags(tag_names: list[str], db: Session) -> list[Tag]:
    tags = []
    for name in tag_names:
        tag = db.query(Tag).filter_by(name=name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
        tags.append(tag)
    return tags


@router.get("/", response_model=List[StrategySummary])
def get_strategies(db: Session = Depends(get_db)):
    strategies = db.query(Strategy).filter(Strategy.deleted == False).all()
    return [
        StrategySummary(
            id=strategy.id,
            name=strategy.name,
            latestVersion=(strategy.versions[-1].version_number),
            createdAt=strategy.created_at,
            updatedAt=strategy.updated_at,
        )
        for strategy in strategies
    ]


@router.post("/", response_model=StrategyDetail, status_code=status.HTTP_201_CREATED)
def post_strategy(data: StrategyCreateRequest, db: Session = Depends(get_db)):
    strategy = Strategy(
        name=data.name,
        description=data.description,
        tags=get_or_create_tags(data.tags, db),
    )
    db.add(strategy)
    db.flush()  # Get ID before inserting version

    version = StrategyVersion(
        strategy=strategy,
        version_number=1,
        template_json=data.template,
        created_at=strategy.created_at,
    )
    db.add(version)
    db.commit()
    db.refresh(strategy)
    return StrategyDetail(
        id=strategy.id,
        name=strategy.name,
        description=strategy.description,
        latestVersion=version.version_number,
        createdAt=strategy.created_at,
        updatedAt=strategy.updated_at,
        tags=[tag.name for tag in strategy.tags],
        template=version.template_json,
    )


@router.get("/{strategy_id}", response_model=StrategyDetail)
def get_strategy_detail(strategy_id: uuid.UUID, db: Session = Depends(get_db)):
    strategy = (
        db.query(Strategy)
        .filter(Strategy.id == strategy_id, Strategy.deleted == False)
        .first()
    )
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return StrategyDetail(
        id=strategy.id,
        name=strategy.name,
        description=strategy.description,
        latestVersion=strategy.versions[-1].version_number,
        createdAt=strategy.created_at,
        updatedAt=strategy.updated_at,
        tags=[tag.name for tag in strategy.tags],
        template=strategy.versions[-1].template_json,
    )


@router.get("/{strategy_id}/versions", response_model=List[StrategyVersionSummary])
def get_strategy_versions(strategy_id: uuid.UUID, db: Session = Depends(get_db)):
    versions = (
        db.query(StrategyVersion)
        .filter(StrategyVersion.strategy_id == strategy_id)
        .order_by(StrategyVersion.version_number.desc())
        .all()
    )
    return [
        StrategyVersionSummary(
            id=version.id,
            version=version.version_number,
            createdAt=version.created_at,
            message=version.message,
        )
        for version in versions
    ]


@router.post(
    "/{strategy_id}/versions",
    response_model=StrategyVersionDetail,
    status_code=status.HTTP_201_CREATED,
)
def post_strategy_version(
    strategy_id: uuid.UUID,
    data: StrategyVersionCreateRequest,
    db: Session = Depends(get_db),
):
    strategy = (
        db.query(Strategy)
        .filter(Strategy.id == strategy_id, Strategy.deleted == False)
        .first()
    )
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    latest_version = (
        db.query(StrategyVersion)
        .filter(StrategyVersion.strategy_id == strategy_id)
        .order_by(StrategyVersion.version_number.desc())
        .first()
    )
    next_version_number = latest_version.version_number + 1 if latest_version else 1

    version = StrategyVersion(
        strategy_id=strategy_id,
        version_number=next_version_number,
        template_json=data.template,
        message=data.message,
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version
