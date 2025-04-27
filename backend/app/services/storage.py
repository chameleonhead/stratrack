from http.client import HTTPException
import os


class BlobStorageClient:
    def read_blob(self, blob_path: str) -> str:
        raise NotImplementedError()


class LocalBlobStorageClient(BlobStorageClient):
    def read_blob(self, blob_path: str) -> str:
        try:
            with open(blob_path.lstrip("/"), "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Local read error: {str(e)}")


# Blob client factory
def get_blob_client() -> BlobStorageClient:
    mode = os.getenv("BLOB_MODE", "local")
    if mode == "local":
        return LocalBlobStorageClient()
    else:
        raise ValueError(f"Unknown BLOB_MODE: {mode}")
