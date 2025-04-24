import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db

from . import crud, logic
from .schemas import (
    StrategyCreateRequest,
    StrategyDetail,
    StrategySummary,
    StrategyVersionCreateRequest,
    StrategyVersionDetail,
    StrategyVersionSummary,
)

router = APIRouter(prefix="/strategies", tags=["Strategies"])


@router.get("/", response_model=list[StrategySummary])
def get_strategies(db: Session = Depends(get_db)):
    strategies = crud.get_all_strategies(db)
    return [
        StrategySummary(
            id=s.id,
            name=s.name,
            latestVersion=s.versions[-1].version_number,
            createdAt=s.created_at,
            updatedAt=s.updated_at,
        )
        for s in strategies
    ]


@router.post("/", response_model=StrategyDetail, status_code=status.HTTP_201_CREATED)
def post_strategy(data: StrategyCreateRequest, db: Session = Depends(get_db)):
    strategy, version = logic.create_strategy_with_first_version(data, db)
    return StrategyDetail(
        id=strategy.id,
        name=strategy.name,
        description=strategy.description,
        latestVersion=version.version_number,
        createdAt=strategy.created_at,
        updatedAt=strategy.updated_at,
        tags=[t.name for t in strategy.tags],
        template=version.template_json,
    )


@router.get("/{strategy_id}", response_model=StrategyDetail)
def get_strategy_detail(strategy_id: uuid.UUID, db: Session = Depends(get_db)):
    strategy = crud.get_strategy_by_id(strategy_id, db)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    latest = strategy.versions[-1]
    return StrategyDetail(
        id=strategy.id,
        name=strategy.name,
        description=strategy.description,
        latestVersion=latest.version_number,
        createdAt=strategy.created_at,
        updatedAt=strategy.updated_at,
        tags=[t.name for t in strategy.tags],
        template=latest.template_json,
    )


@router.get("/{strategy_id}/versions", response_model=list[StrategyVersionSummary])
def get_strategy_versions(strategy_id: uuid.UUID, db: Session = Depends(get_db)):
    versions = crud.get_strategy_versions(strategy_id, db)
    return [
        StrategyVersionSummary(
            id=v.id,
            version=v.version_number,
            createdAt=v.created_at,
            message=v.message,
        )
        for v in versions
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
    strategy = crud.get_strategy_by_id(strategy_id, db)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    version = logic.create_new_strategy_version(strategy_id, data, db)
    return version
