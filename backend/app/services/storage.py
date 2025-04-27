import os


class BlobStorageException(Exception):
    pass


class BlobStorageClient:
    def read_blob(self, container_name: str, blob_name: str) -> str:
        raise NotImplementedError()

    def upload_blob(
        self, container_name: str, blob_name: str, data: bytes
    ) -> tuple[str, int]:
        raise NotImplementedError()


class LocalBlobStorageClient(BlobStorageClient):
    def __init__(self):
        self._base_path = os.getenv("BLOB_STORAGE_PATH", "./storage")

    def read_blob(self, container_name: str, blob_name: str) -> str:
        try:
            with open(
                os.path.join(self._base_path, container_name.lstrip("/"), blob_name),
                "r",
                encoding="utf-8",
            ) as f:
                return f.read()
        except Exception as e:
            raise BlobStorageException(e) from e

    def upload_blob(self, container_name: str, blob_name: str, data: bytes) -> int:
        try:
            path = os.path.join(self._base_path, container_name.lstrip("/"), blob_name)
            os.makedirs(os.path.dirname(path))
            with open(path, "wb") as f:
                f.write(data)
            return len(data)
        except Exception as e:
            raise BlobStorageException(e) from e


# Blob client factory
def get_blob_client() -> BlobStorageClient:
    mode = os.getenv("BLOB_MODE", "local")
    if mode == "local":
        return LocalBlobStorageClient()
    else:
        raise ValueError(f"Unknown BLOB_MODE: {mode}")
