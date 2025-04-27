import logging
import time
from multiprocessing import Queue

from app.workers.backtest_executor import execute_backtest
from app.workers.task_queue import dequeue_backtest, set_task_queue

logger = logging.getLogger(__name__)


def run_worker(queue: Queue):
    set_task_queue(queue)
    logger.info("[Worker] Started.")
    while True:
        task_id = dequeue_backtest()
        if task_id:
            logger.info(f"[Worker] Executing: {task_id}")
            try:
                execute_backtest(task_id, logger)
                logger.info("[Worker] Finished.")
            except Exception as e:
                logger.error(f"[Worker] Error: {e}")
                logger.exception(e, exc_info=True)
        else:
            time.sleep(0.5)
