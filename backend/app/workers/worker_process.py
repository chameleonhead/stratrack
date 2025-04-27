import time
from multiprocessing import Queue

from app.workers.backtest_executor import execute_backtest
from app.workers.task_queue import dequeue_backtest, set_task_queue


def run_worker(queue: Queue):
    set_task_queue(queue)
    print("[Worker] Started.")
    while True:
        task_id = dequeue_backtest()
        if task_id:
            print(f"[Worker] Executing: {task_id}")
            try:
                execute_backtest(task_id)
            except Exception as e:
                print(f"[Worker] Error: {e}")
        else:
            time.sleep(0.5)
