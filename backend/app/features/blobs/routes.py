from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.storage import BlobStorageClient, get_blob_client

from . import crud

router = APIRouter(prefix="/blobs", tags=["Blobs"])


@router.get("/{container_name}/{blob_name:path}")
def get_blob_detail(
    container_name: str,
    blob_name: str,
    db: Session = Depends(get_db),
    blob_client: BlobStorageClient = Depends(get_blob_client),
):
    blob = crud.get_blob_by_name(container_name, blob_name, db)
    if not blob:
        raise HTTPException(status_code=404, detail="Blob not found")

    data = blob_client.read_blob(container_name, blob_name)

    return StreamingResponse(
        data,
        media_type="application/octet-stream",
        headers=blob.metadata,
    )
