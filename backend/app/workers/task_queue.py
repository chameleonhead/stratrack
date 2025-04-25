from __future__ import annotations

from multiprocessing import Queue

# プロセス間で共有可能なキュー（起動元で渡す）
task_queue: Queue | None = None


def set_task_queue(queue: Queue):
    global task_queue
    task_queue = queue


def enqueue_backtest(backtest_id: str):
    if task_queue is None:
        raise RuntimeError("Task queue not set")
    task_queue.put(backtest_id)


def dequeue_backtest() -> str | None:
    if task_queue is None:
        raise RuntimeError("Task queue not set")
    try:
        return task_queue.get(timeout=1)
    except Exception:
        return None
