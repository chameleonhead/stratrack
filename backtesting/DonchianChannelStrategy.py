from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

import json
import os.path  # To manage paths
import sys  # To find out the script name (in argv[0])
from backtrader import bt

class GeneratedStrategy(bt.Strategy):
    def __init__(self):
        self.order_history = []
        self.trade_history = []
        self.rsi14 = bt.indicators.RSI(self.data.close, period=14)
        self.rsi_sma90 = bt.indicators.SMA(self.rsi14, period=90)
        self.rsi_sma90_sma90 = bt.indicators.SMA(self.rsi_sma90, period=90)
        self.order = None
    def notify_order(self, order):
        if order.status in [order.Completed, order.Canceled, order.Rejected]:
            self.order_history.append(order)
            self.order = None
    def notify_trade(self, trade):
        if trade.isclosed:
            self.trade_history.append(trade)
    def next(self):
        if self.order:
            return
        if not self.position:
            if (self.rsi_sma90[0] > self.rsi_sma90[-1]) and (self.rsi_sma90_sma90[0] > self.rsi_sma90_sma90[-1]) and ((self.rsi14[-2] > 30 and self.rsi14[-3] > 30 and self.rsi14[-4] > 30 and self.rsi14[-5] > 30 and self.rsi14[-6] > 30)) and (self.rsi14[-1] < 30 and self.rsi14[0] > 30):
                self.order = self.buy()
        if self.position and self.position.size > 0:
            if self.rsi14[0] > 70:
                self.order = self.close()

if __name__ == '__main__':
    # Create a cerebro entity
    cerebro = bt.Cerebro()

    # Add a strategy
    cerebro.addstrategy(GeneratedStrategy)

    # Datas are in a subfolder of the samples. Need to find where the script is
    # because it could have been called from anywhere
    modpath = os.path.dirname(os.path.abspath(sys.argv[0]))
    datapath = os.path.join(modpath, './AUDUSD.oj1m5.csv')

    # Create a Data Feed
    data = bt.feeds.MT4CSVData(
        dataname=datapath,
    )

    # Add the Data Feed to Cerebro
    cerebro.adddata(data)

    # Set our desired cash start
    cerebro.broker.setcash(100000.0)
    cerebro.broker.set_coo(True)
    cerebro.broker.set_coc(True)

    # Print out the starting conditions
    print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())

    # Run over everything
    strategies = cerebro.run()

    # Print out the final result
    print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())

    for trade in strategies[0].trade_history:
        print(trade)

    cerebro.plot()