import json
from datetime import datetime

import backtrader as bt
import pandas as pd


class MyStrategy(bt.Strategy):
    def __init__(self):
        pass

    def next(self):
        if not self.position:
            self.buy()
        elif len(self) > 10:
            self.close()


# モック用OHLCデータの作成
def load_mock_data():
    now = datetime.utcnow()
    index = pd.date_range(now, periods=30, freq="1min")
    df = pd.DataFrame(
        {
            "open": 1.0,
            "high": 1.1,
            "low": 0.9,
            "close": 1.05,
            "volume": 1000,
        },
        index=index,
    )
    df.index.name = "datetime"
    return df


def main():
    cerebro = bt.Cerebro()
    df = load_mock_data()
    data = bt.feeds.PandasData(dataname=df)

    cerebro.adddata(data)
    cerebro.addstrategy(MyStrategy)
    cerebro.broker.set_cash(100000)
    cerebro.run()

    # 成績の出力（本番ではもっと詳細に）
    result = {
        "final_value": cerebro.broker.getvalue(),
        "trades": [],  # 後でログ取得も可能
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
