import uuid

from sqlalchemy.orm import Session

from . import crud
from .schemas import StrategyCreateRequest, StrategyVersionCreateRequest


def create_strategy_with_first_version(data: StrategyCreateRequest, db: Session):
    try:
        strategy = crud.create_strategy(
            data.name,
            data.description,
            data.tags,
            db,
        )
        version = crud.create_strategy_version(
            strategy_id=strategy.id,
            version_number=1,
            template=data.template,
            generated_code=data.generatedCode,
            message=None,
            db=db,
        )
        db.commit()
        db.refresh(strategy)
        return strategy, version
    except Exception:
        db.rollback()
        raise


def get_next_version_number(strategy_id: uuid.UUID, db: Session) -> int:
    latest = crud.get_latest_version(strategy_id, db)
    return latest.version_number + 1 if latest else 1


def create_new_strategy_version(
    strategy_id: uuid.UUID, data: StrategyVersionCreateRequest, db: Session
):
    try:
        next_version = get_next_version_number(strategy_id, db)
        version = crud.create_strategy_version(
            strategy_id=strategy_id,
            version_number=next_version,
            template=data.template,
            generated_code=data.generatedCode,
            message=data.message,
            db=db,
        )
        db.commit()
        db.refresh(version)
        return version
    except Exception:
        db.rollback()
        raise
