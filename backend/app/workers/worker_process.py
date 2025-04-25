import time
from multiprocessing import Queue

from app.workers.backtest_executor import execute_backtest
from app.workers.task_queue import dequeue_backtest, set_task_queue


def run_worker(queue: Queue):
    set_task_queue(queue)
    print("[Worker] Started.")
    while True:
        task = dequeue_backtest()
        if task:
            print(f"[Worker] Executing: {task}")
            try:
                execute_backtest(task)
            except Exception as e:
                print(f"[Worker] Error: {e}")
        else:
            time.sleep(0.5)
