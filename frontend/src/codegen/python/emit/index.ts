import { IRProgram } from "../../ir/ast";
import { PyModule, PyStatement } from "../ast";
import { assign, attr, bin, call, comment, forStmt, imp, lit, mod, ref, stmt } from "../helper";
import { emitBtIndicatorFromIR } from "./emitIndicator";
import { emitBtStrategyFromIR } from "./emitStrategy";

export function emitBtProgramFromIR(program: IRProgram): PyModule {
  const indicators = program.indicatorDefs.map((i) => emitBtIndicatorFromIR(i));
  const strategy = emitBtStrategyFromIR(program.strategy);

  const main: PyStatement[] = [
    imp("sys, os"),
    comment("Create a cerebro entity"),
    assign(ref("cerebro"), call(ref("bt.Cerebro"), [])),
    comment("Add a strategy"),
    stmt(call(attr(ref("cerebro"), "addstrategy"), [ref(strategy.name)])),
    comment("data is relative to the script location"),
    assign(
      ref("modpath"),
      call(ref("os.path.dirname"), [call(ref("os.path.abspath"), [ref("sys.argv[0]")])])
    ),
    assign(
      ref("datapath"),
      call(ref("os.path.join"), [ref("modpath"), ref("'./AUDUSD.oj1m5.csv'")])
    ),
    comment("Create a Data Feed"),
    assign(ref("data"), call(ref("bt.feeds.MT4CSVData"), [ref("dataname=datapath")])),
    comment("Add the Data Feed to Cerebro"),
    stmt(call(attr(ref("cerebro"), "adddata"), [ref("data")])),
    comment("Set our desired cash start"),
    stmt(call(attr(ref("cerebro"), "broker.setcash"), [lit(100000.0)])),
    stmt(call(attr(ref("cerebro"), "broker.set_coo"), [lit(true)])),
    stmt(call(attr(ref("cerebro"), "broker.set_coc"), [lit(true)])),
    comment("Print out the starting conditions"),
    stmt(
      call(ref("print"), [
        bin("%", lit("Starting Portfolio Value: %.2f"), call(ref("cerebro.broker.getvalue"), [])),
      ])
    ),
    comment("Run over everything"),
    assign(ref("strategies"), call(ref("cerebro.run"), [])),
    comment("Print out the final result"),
    stmt(
      call(ref("print"), [
        bin("%", lit("Final Portfolio Value: %.2f"), call(ref("cerebro.broker.getvalue"), [])),
      ])
    ),
    comment("Print out the trade history"),
    stmt(call(ref("print"), [lit("Trade History:")])),
    stmt(call(ref("print"), [lit("---------------------------------------------------")])),
    stmt(call(ref("print"), [lit("Trade ID, Date, Size, Price, Commission")])),
    forStmt("trade", ref("strategies[0].trade_history"), [
      stmt(call(ref("print"), [ref("trade")])),
    ]),
    stmt(call(ref("cerebro.plot"), [])),
  ];

  return mod([...indicators, strategy], [imp("backtrader as bt")], main);
}
