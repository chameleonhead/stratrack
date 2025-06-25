import { IRStrategy } from "../../ir/ast";
import { PyAssignment, PyClass, PyFunction, PyStatement } from "../ast";
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
  sub,
  tuple,
} from "../helper";
import { emitPyCondExpr, emitPyExpr } from "./emitExpr";
import { BASE_TIMEFRAME } from "./emitExpr";

export function emitBtStrategyFromIR(strategy: IRStrategy): PyClass {
  const fields: PyAssignment[] = [];
  fields.push(assign(ref("lines"), tuple(strategy.variables.map((v) => lit(`_${v.name}`)))));
  const initBody: PyStatement[] = [];
  initBody.push(assign(attr(ref("self"), "order_history"), list([])));
  initBody.push(assign(attr(ref("self"), "trade_history"), list([])));
  initBody.push(assign(attr(ref("self"), "base_timeframe"), ref("base_timeframe")));
  initBody.push(
    ...strategy.indicators.map((v) =>
      assign(
        attr(ref("self"), v.id),
        call(
          ref(v.pascalName),
          v.params.map((p) =>
            bin("=", ref(p.name), emitPyExpr(p.value, "array", 0, BASE_TIMEFRAME))
          )
        )
      )
    )
  );
  initBody.push(assign(attr(ref("self"), "order"), lit(null)));

  const entryConds = strategy.entryConditions.map((e) =>
    iff(emitPyCondExpr(e.condition, 0, BASE_TIMEFRAME), [
      stmt(call(attr(ref("self"), e.type === "long" ? "buy" : "sell"))),
    ])
  );

  const exitConds = strategy.exitConditions.map((e) =>
    iff(emitPyCondExpr(e.condition, 0, BASE_TIMEFRAME), [
      stmt(call(attr(ref("self"), e.type === "long" ? "close" : "close"))),
    ])
  );

  const nextBody: PyStatement[] = [];
  nextBody.push(
    ...strategy.variables.map((v) =>
      assign(
        sub(attr(ref("self.lines"), `_${v.name}`), lit(0)),
        emitPyExpr(v.expression, "scalar", 0, BASE_TIMEFRAME)
      )
    )
  );
  nextBody.push(iff(ref("self.order"), [ret()]));
  nextBody.push(iff(unary("not", ref("self.position")), entryConds));
  nextBody.push(iff(ref("self.position"), exitConds));

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

  const nextFunc: PyFunction = fn("next", ["self"], nextBody);

  const initFunc: PyFunction = fn("__init__", ["self", "base_timeframe"], initBody);

  return cls(
    strategy.name,
    fields,
    [initFunc, notifyOrderFunc, notifyTradeFunc, nextFunc],
    ["bt.Strategy"]
  );
}
