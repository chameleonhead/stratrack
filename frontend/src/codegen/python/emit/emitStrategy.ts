import { IRStrategy } from "../../ir/ast";
import { PyClass, PyFunction, PyStatement } from "../ast";
import { iff, stmt, call, attr, ref, func, cls } from "../helper";
import { emitVariableAssign, emitPyCondExpr } from "./emitExpr";

export function emitBtStrategyFromIR(strategy: IRStrategy): PyClass {
  const initBody: PyStatement[] = strategy.variables.map(emitVariableAssign);

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

  const nextFunc: PyFunction = func("next", ["self"], [...entryConds, ...exitConds]);

  const initFunc: PyFunction = func("__init__", ["self"], initBody);

  return cls(strategy.name, [initFunc, nextFunc], ["bt.Strategy"]);
}
