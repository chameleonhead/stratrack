import uuid

from sqlalchemy.orm import Session

from .models import Strategy, StrategyVersion, Tag


def get_strategy_by_id(strategy_id: uuid.UUID, db: Session) -> Strategy | None:
    return (
        db.query(Strategy)
        .filter(Strategy.id == strategy_id, Strategy.deleted.is_(False))
        .first()
    )


def get_all_strategies(db: Session) -> list[Strategy]:
    return db.query(Strategy).filter(Strategy.deleted.is_(False)).all()


def get_or_create_tags(tag_names: list[str], db: Session) -> list[Tag]:
    tags = []
    for name in tag_names:
        tag = db.query(Tag).filter_by(name=name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
        tags.append(tag)
    return tags


def create_strategy(
    name: str,
    description: str,
    tag_names: list[str],
    db: Session,
) -> Strategy:
    tags = get_or_create_tags(tag_names, db)
    strategy = Strategy(name=name, description=description, tags=tags)
    db.add(strategy)
    db.flush()
    return strategy


def get_strategy_versions(strategy_id: uuid.UUID, db: Session) -> list[StrategyVersion]:
    return (
        db.query(StrategyVersion)
        .filter(StrategyVersion.strategy_id == strategy_id)
        .order_by(StrategyVersion.version_number.desc())
        .all()
    )


def get_latest_version(strategy_id: uuid.UUID, db: Session) -> StrategyVersion | None:
    return (
        db.query(StrategyVersion)
        .filter(StrategyVersion.strategy_id == strategy_id)
        .order_by(StrategyVersion.version_number.desc())
        .first()
    )


def create_strategy_version(
    strategy_id: uuid.UUID,
    version_number: int,
    template: dict,
    generated_code: str | None,
    message: str | None,
    db: Session,
) -> StrategyVersion:
    version = StrategyVersion(
        strategy_id=strategy_id,
        version_number=version_number,
        template_json=template,
        generated_code=generated_code,
        message=message,
    )
    db.add(version)
    db.flush()
    return version
