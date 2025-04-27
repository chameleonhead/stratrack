from sqlalchemy.orm import Session

from .models import Blob


def get_blob_by_name(container_name: str, blob_name: str, db: Session) -> Blob | None:
    return (
        db.query(Blob)
        .filter(
            Blob.container_name == container_name,
            Blob.blob_name == blob_name,
            Blob.deleted.is_(False),
        )
        .first()
    )
