from contextlib import asynccontextmanager
from multiprocessing import Process, Queue

from fastapi import FastAPI

from app.db.init_db import init_db
from app.features.backtesting.main import app as backtesting_app
from app.features.datasources.main import app as datasources_app
from app.features.strategies.main import app as strategies_app
from app.workers.task_queue import set_task_queue
from app.workers.worker_process import run_worker

# グローバルでプロセス・キューを持つ
task_queue = Queue()
worker_process: Process | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global worker_process

    # DB初期化
    init_db()

    # タスクキュー登録
    set_task_queue(task_queue)

    # ワーカープロセス起動
    worker_process = Process(target=run_worker, args=(task_queue,))
    worker_process.start()
    print("[Main] Worker process started.")

    yield

    # アプリ終了時にプロセス終了
    if worker_process is not None:
        print("[Main] Terminating worker process...")
        worker_process.terminate()
        worker_process.join()
        print("[Main] Worker process stopped.")


# FastAPIアプリ定義
app = FastAPI(lifespan=lifespan)

# 各サブアプリのマウント
app.mount("/strategies", strategies_app)
app.mount("/data-sources", datasources_app)
app.mount("/backtesting", backtesting_app)
