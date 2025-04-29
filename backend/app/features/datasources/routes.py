import os
import shutil
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.data_streamer import stream_data_chunks
from app.services.storage import BlobStorageClient, get_blob_client

from . import crud
from .models import DataChunk, DataSource, UploadHistory
from .schemas import (
    DataChunkRead,
    DataChunkUpdate,
    DataSourceCreate,
    DataSourceRead,
    UploadHistoryRead,
)

router = APIRouter(tags=["DataSources"])

UPLOAD_RULES = {
    "dukascopy": {
        "tick": "dukascopy_tick",
        "M1": "dukascopy_ohlc",
        "M5": "dukascopy_ohlc",
    },
    "mt4_csv": {
        "any": "mt4_csv",
    },
    "generic": {
        "any": "generic_csv_or_json",
    },
}

# 保存用ディレクトリ
TEMP_DIR = "./tmp/uploads"


def save_temp_file(file) -> str:
    """UploadFileを一時保存"""
    os.makedirs(TEMP_DIR, exist_ok=True)
    temp_filename = f"{uuid4()}.tmp"
    temp_path = os.path.join(TEMP_DIR, temp_filename)
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return temp_path


def get_allowed_upload_type(source_type: str, timeframe: str) -> str | None:
    """DataSourceのsource_typeとtimeframeから許可ファイル種別を取得"""
    rule = UPLOAD_RULES.get(source_type)
    if not rule:
        return None
    if timeframe in rule:
        return rule[timeframe]
    if "any" in rule:
        return rule["any"]
    return None


def parse_uploaded_file(file_path: str, file_type: str) -> list[dict]:
    """ファイルを読み込みパース（超簡易版）"""
    records = []
    if file_type in {
        "dukascopy_tick",
        "dukascopy_ohlc",
        "mt4_csv",
        "generic_csv_or_json",
    }:
        with open(file_path, encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split(",")
                # 仮に [timestamp, open, high, low, close, volume] など
                ts = datetime.fromisoformat(parts[0])
                record = {
                    "timestamp": ts,
                    "data": parts[1:],  # 残りデータ
                }
                records.append(record)
    else:
        raise ValueError(f"Unsupported file_type: {file_type}")
    return records


def split_into_chunks(
    records: list[dict], file_type: str, chunk_period: str = "1h"
) -> list[list[dict]]:
    """レコードを時間で分割"""
    chunks = []
    if not records:
        return chunks

    records = sorted(records, key=lambda x: x["timestamp"])  # 念のためソート

    current_chunk = []
    if chunk_period == "1h":
        unit = timedelta(hours=1)
    elif chunk_period == "1d":
        unit = timedelta(days=1)
    else:
        raise ValueError(f"Unsupported chunk period: {chunk_period}")

    start_time = records[0]["timestamp"]
    end_time = start_time + unit

    for record in records:
        if record["timestamp"] >= end_time:
            chunks.append(current_chunk)
            current_chunk = []
            start_time = record["timestamp"]
            end_time = start_time + unit
        current_chunk.append(record)

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


def save_chunks_to_storage(
    db,
    chunks: list[list[dict]],
    data_source_id,
    upload_history_id,
    blob_client: BlobStorageClient,
):
    """チャンクをBlob保存＆DB登録"""
    for idx, chunk_records in enumerate(chunks):
        if not chunk_records:
            continue

        # ファイル名を生成
        first_ts = chunk_records[0]["timestamp"]
        last_ts = chunk_records[-1]["timestamp"]
        container_name = f"{data_source_id}"
        blob_name = f"{first_ts:%Y%m%d%H%M%S}_{last_ts:%Y%m%d%H%M%S}.csv"

        # ファイルに一時保存
        local_path = f"./tmp/chunks/{uuid4()}.csv"
        os.makedirs(os.path.dirname(local_path), exist_ok=True)

        with open(local_path, "w", encoding="utf-8") as f:
            for record in chunk_records:
                line = f"{record['timestamp'].isoformat()},{','.join(record['data'])}\n"
                f.write(line)

        # Blobにアップロード
        blob_url = blob_client.upload_file(local_path, container_name, blob_name)

        # ファイルサイズ取得
        file_size = os.path.getsize(local_path)

        # DB登録
        chunk = DataChunk(
            data_source_id=data_source_id,
            upload_history_id=upload_history_id,
            start_at=first_ts,
            end_at=last_ts,
            blob_url=blob_url,
            file_size=file_size,
            is_active=True,
            priority=0,
        )
        db.add(chunk)

        # 後片付け
        os.remove(local_path)


@router.get("/data-sources", response_model=list[DataSourceRead])
def list_data_sources(db: Session = Depends(get_db)):
    return [
        DataSourceRead(
            id=ds.id,
            symbol=ds.symbol,
            timeframe=ds.timeframe,
            sourceType=ds.source_type,
            description=ds.description,
            createdAt=ds.created_at,
        )
        for ds in db.query(DataSource).all()
    ]


@router.post("/data-sources", response_model=DataSourceRead, status_code=201)
def create_data_source(data: DataSourceCreate, db: Session = Depends(get_db)):
    ds = crud.create_data_source(db, data)
    db.commit()
    db.refresh(ds)
    return DataSourceRead(
        id=ds.id,
        symbol=ds.symbol,
        timeframe=ds.timeframe,
        sourceType=ds.source_type,
        description=ds.description,
        createdAt=ds.created_at,
    )


@router.get("/data-sources/{data_source_id}", response_model=DataSourceRead)
def get_data_source(data_source_id: UUID, db: Session = Depends(get_db)):
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")
    return DataSourceRead(
        id=ds.id,
        symbol=ds.symbol,
        timeframe=ds.timeframe,
        sourceType=ds.source_type,
        description=ds.description,
        createdAt=ds.created_at,
    )


@router.delete("/data-sources/{data_source_id}", status_code=204)
def delete_data_source(data_source_id: UUID, db: Session = Depends(get_db)):
    ds = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="DataSource not found")
    db.delete(ds)
    db.commit()
    return


@router.post("/data-sources/{data_source_id}/upload")
async def upload_data_source(
    data_source_id: UUID,
    file: UploadFile,
    db: Session = Depends(get_db),
    blob_client=Depends(get_blob_client),
):
    # 1. DataSource取得
    data_source = db.query(DataSource).filter(DataSource.id == data_source_id).first()
    if not data_source:
        raise HTTPException(status_code=404, detail="DataSource not found")

    # 2. アップロードルール確認
    source_type = data_source.source_type
    timeframe = data_source.timeframe
    allowed_type = get_allowed_upload_type(source_type, timeframe)
    if allowed_type is None:
        raise HTTPException(
            status_code=400, detail="Unsupported upload type for this DataSource"
        )

    # 3. ファイル一時保存
    temp_path = await save_temp_file(file)

    # 4. ファイルパース
    records = parse_uploaded_file(temp_path, allowed_type)

    # 5. チャンク分割
    chunks = split_into_chunks(records, allowed_type)

    # 6. アップロード履歴作成
    upload_history = UploadHistory(
        data_source_id=data_source_id,
        file_name=file.filename,
        source_type=source_type,
        timeframe=timeframe,
        message=None,
    )
    db.add(upload_history)
    db.flush()  # upload_history.idを取るためflushしておく

    # 7. チャンク保存
    save_chunks_to_storage(
        db=db,
        chunks=chunks,
        data_source_id=data_source_id,
        upload_history_id=upload_history.id,
        blob_client=blob_client,
    )

    db.commit()

    return {"message": "Upload and chunking completed successfully"}


@router.get(
    "/data-sources/{data_source_id}/import-histories",
    response_model=list[UploadHistoryRead],
)
def list_import_histories(
    data_source_id: UUID,
    db: Session = Depends(get_db),
):
    return [
        UploadHistoryRead(
            id=history.id,
            dataSourceId=history.data_source_id,
            importedAt=history.imported_at,
            status=history.status,
            message=history.message,
        )
        for history in (
            db.query(UploadHistory)
            .filter(UploadHistory.data_source_id == data_source_id)
            .all()
        )
    ]


@router.get("/data-sources/{data_source_id}/chunks", response_model=list[DataChunkRead])
def list_data_chunks(
    data_source_id: UUID,
    start: datetime | None = None,
    end: datetime | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(DataChunk).filter(
        DataChunk.data_source_id == data_source_id,
        DataChunk.is_active.is_(True),
    )
    if start:
        query = query.filter(DataChunk.end_at >= start)
    if end:
        query = query.filter(DataChunk.start_at <= end)
    return [
        DataChunkRead(
            id=chunk.id,
            dataSourceId=chunk.data_source_id,
            uploadHistoryId=chunk.import_history_id,
            uploadedAt=chunk.imported_at,
            startAt=chunk.start_at,
            endAt=chunk.end_at,
            fileSize=chunk.file_size,
            isActive=chunk.is_active,
            priority=chunk.priority,
        )
        for chunk in query.order_by(DataChunk.priority.desc()).all()
    ]


@router.get("/data-sources/{data_source_id}/stream")
def stream_data(
    data_source_id: UUID,
    start: datetime,
    end: datetime,
    db: Session = Depends(get_db),
    blob_client: BlobStorageClient = Depends(get_blob_client),
):
    generator = stream_data_chunks(db, data_source_id, start, end, blob_client)
    return StreamingResponse(generator, media_type="text/plain")


@router.patch("/data-chunks/{chunk_id}", response_model=DataChunkRead)
def update_data_chunk(
    chunk_id: UUID,
    patch: DataChunkUpdate,
    db: Session = Depends(get_db),
):
    chunk = db.query(DataChunk).filter(DataChunk.id == chunk_id).first()
    if not chunk:
        raise HTTPException(status_code=404, detail="DataChunk not found")

    for key, value in patch.dict(exclude_unset=True).items():
        setattr(chunk, key, value)

    db.commit()
    db.refresh(chunk)
    return DataChunkRead(
        id=chunk.id,
        dataSourceId=chunk.data_source_id,
        uploadHistoryId=chunk.upload_history_id,
        startAt=chunk.start_at,
        endAt=chunk.end_at,
        fileSize=chunk.file_size,
        isActive=chunk.is_active,
        priority=chunk.priority,
        uploadedAt=chunk.uploaded_at,
    )
