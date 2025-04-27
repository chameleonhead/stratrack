import json
import logging
import subprocess
import tempfile
import traceback
from pathlib import Path

import pandas as pd

from app.db.session import get_db
from app.features.backtesting.models import BacktestRun
from app.features.backtesting.schemas import BacktestStatus
from app.features.strategies.models import StrategyVersion


def write_json(obj: dict | list, path: Path):
    with open(path, "w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)


def write_dataframe(df: pd.DataFrame, path: Path):
    df.to_csv(path, index=True)


def execute_backtest(backtest_id: str, logger: logging.Logger):
    db = next(get_db())

    run: BacktestRun = db.query(BacktestRun).filter_by(id=backtest_id).first()
    if not run:
        logger.info(f"[Executor] Backtest {backtest_id} not found")
        return

    strategy_version: StrategyVersion = run.strategy_version
    if not strategy_version or not strategy_version.generated_code:
        run.status = BacktestStatus.failed
        run.error_message = "No strategy code found"
        db.commit()
        return

    try:
        logger.info(f"[Executor] Starting backtest: {backtest_id}")
        run.status = BacktestStatus.running
        db.commit()

        # 一時作業用ディレクトリ作成
        work_dir = Path(tempfile.mkdtemp(prefix="bt_"))

        # 入力ファイルを書き出し
        code_path = work_dir / "strategy.py"
        code_path.write_text(strategy_version.generated_code, encoding="utf-8")

        params = run.parameters or {}
        params["initial_cash"] = params.get("initial_cash", 100000)
        write_json(params, work_dir / "params.json")

        # データ取得 (tick → OHLC変換済みのDataFrameを想定)
        df = fetch_ohlcv_data(
            data_source_id=run.data_source_id,
            timeframe=run.timeframe,
            start=run.start_time,
            end=run.end_time,
        )
        write_dataframe(df, work_dir / "data.csv")

        # 実行
        result = subprocess.run(
            ["python", str(code_path), "--input-dir", str(work_dir)],
            capture_output=True,
            text=True,
            timeout=60,
        )

        if result.returncode != 0:
            run.status = BacktestStatus.failed
            run.error_message = f"Execution failed: {result.stderr}"
        else:
            run.status = BacktestStatus.success
            run.result_summary = json.load(open(work_dir / "result.json"))
            run.log = json.load(open(work_dir / "trades.json"))
            run.chart_data = json.load(open(work_dir / "chart_data.json"))

        db.commit()

    except Exception as e:
        run.status = BacktestStatus.failed
        run.error_message = f"Exception: {str(e)}\n{traceback.format_exc()}"
        db.commit()
