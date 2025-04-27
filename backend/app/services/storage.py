import os
import shutil

from app.db.session import get_db
from app.features.blobs.models import Blob


class BlobStorageException(Exception):
    pass


class BlobStorageClient:
    def read_blob(self, container_name: str, blob_name: str) -> bytes:
        raise NotImplementedError()

    def upload_file(self, local_path: str, container_name: str, blob_name: str) -> int:
        raise NotImplementedError()

    def upload_blob(self, container_name: str, blob_name: str, data: bytes) -> int:
        raise NotImplementedError()


class LocalBlobStorageClient(BlobStorageClient):
    def __init__(self):
        self._base_path = os.getenv("BLOB_STORAGE_PATH", "./storage")

    def read_blob(self, container_name: str, blob_name: str) -> bytes:
        try:
            with open(
                os.path.join(self._base_path, container_name.lstrip("/"), blob_name),
                "rb",
            ) as f:
                return f.read()
        except Exception as e:
            raise BlobStorageException(e) from e

    def upload_file(
        self, local_path: str, container_name: str, blob_name: str
    ) -> tuple[str, int]:
        db = get_db()
        try:
            blob_path = os.path.join(container_name.lstrip("/"), blob_name)
            db.add(
                Blob(
                    container_name=container_name,
                    blob_name=blob_name,
                    meta_data={"Content-Type": "application/octet-stream"},
                    blob_path=f"/blobs/{blob_path}",
                )
            )

            path = os.path.join(self._base_path, blob_path)
            os.makedirs(os.path.dirname(path))
            with open(path, "wb") as rf:
                with open(local_path, "rb") as lf:
                    shutil.copyfileobj(lf, rf)
            return f"/blobs/{blob_path}", os.path.getsize(local_path)
        except Exception as e:
            raise BlobStorageException(e) from e

    def upload_blob(self, container_name: str, blob_name: str, data: bytes) -> int:
        db = get_db()
        try:
            blob_path = os.path.join(container_name.lstrip("/"), blob_name)
            db.add(
                Blob(
                    container_name=container_name,
                    blob_name=blob_name,
                    meta_data={"Content-Type": "application/octet-stream"},
                    blob_path=f"/blobs/{blob_path}",
                )
            )

            path = os.path.join(self._base_path, blob_path)
            os.makedirs(os.path.dirname(path))
            with open(path, "wb") as f:
                f.write(data)
            return f"/blobs/{blob_path}", len(data)
        except Exception as e:
            raise BlobStorageException(e) from e


# Blob client factory
def get_blob_client() -> BlobStorageClient:
    mode = os.getenv("BLOB_MODE", "local")
    if mode == "local":
        return LocalBlobStorageClient()
    else:
        raise ValueError(f"Unknown BLOB_MODE: {mode}")
