import { IRStrategy } from "../../ir/ast";
import { PyClass, PyFunction, PyStatement } from "../ast";
import {
  iff,
  stmt,
  call,
  attr,
  ref,
  fn,
  cls,
  bin,
  list,
  assign,
  lit,
  ret,
  unary,
} from "../helper";
import { emitVariableAssign, emitPyCondExpr } from "./emitExpr";

export function emitBtStrategyFromIR(strategy: IRStrategy): PyClass {
  const initBody: PyStatement[] = [];
  initBody.push(assign(attr(ref("self"), "order_history"), list([])));
  initBody.push(assign(attr(ref("self"), "trade_history"), list([])));
  initBody.push(...strategy.variables.map(emitVariableAssign));
  initBody.push(assign(attr(ref("self"), "order"), lit(null)));

  const entryConds = strategy.entryConditions.map((e) =>
    iff(emitPyCondExpr(e.condition), [
      stmt(call(attr(ref("self"), e.type === "long" ? "buy" : "sell"))),
    ])
  );

  const exitConds = strategy.exitConditions.map((e) =>
    iff(emitPyCondExpr(e.condition), [
      stmt(call(attr(ref("self"), e.type === "long" ? "close" : "close"))),
    ])
  );

  const nextFuncBody: PyStatement[] = [];
  nextFuncBody.push(iff(ref("self.order"), [ret()]));
  nextFuncBody.push(iff(unary("not", ref("self.position")), entryConds));
  nextFuncBody.push(iff(ref("self.position"), exitConds));

  const notifyOrderFunc: PyFunction = fn(
    "notify_order",
    ["self", "order"],
    [
      iff(
        bin(
          "in",
          ref("order.status"),
          list([ref("order.Completed"), ref("order.Canceled"), ref("order.Rejected")])
        ),
        [
          stmt(call(attr(ref("self"), "order_history.append"), [ref("order")])), // Append order to order history
          assign(ref("self.order"), lit(null)), // Reset order to None
        ]
      ),
    ]
  );

  const notifyTradeFunc: PyFunction = fn(
    "notify_trade",
    ["self", "trade"],
    [
      iff(ref("trade.isclosed"), [
        stmt(call(attr(ref("self"), "trade_history.append"), [ref("trade")])), // Append trade to trade history
      ]),
    ]
  );

  const nextFunc: PyFunction = fn("next", ["self"], nextFuncBody);

  const initFunc: PyFunction = fn("__init__", ["self"], initBody);

  return cls(
    strategy.name,
    [],
    [initFunc, notifyOrderFunc, notifyTradeFunc, nextFunc],
    ["bt.Strategy"]
  );
}
