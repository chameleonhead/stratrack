import { IRIndicatorDefinition } from "../../ir/ast";
import { PyClass, PyAssignment, PyStatement, PyFunction } from "../ast";
import { assign, ref, tuple, lit, fn, attr, cls, sub } from "../helper";
import { emitAggregationMethod, emitPyExpr } from "./emitExpr";

export function emitBtIndicatorFromIR(ind: IRIndicatorDefinition): PyClass {
  const fields: PyAssignment[] = [];
  fields.push(
    assign(
      ref("lines"),
      tuple(ind.variables.map((v) => lit(`_${v.name}`)).concat(ind.exportVars.map((v) => lit(v))))
    )
  );
  fields.push(
    assign(
      ref("params"),
      tuple(
        ind.params.map((p) =>
          tuple([
            lit(p.name),
            lit(typeof p.default === "number" ? p.default : p.default?.toString() || null),
          ])
        )
      )
    )
  );

  const nextBody: PyStatement[] = [];
  nextBody.push(
    ...ind.variables.map((v) =>
      assign(sub(attr(ref("self.lines"), `_${v.name}`), lit(0)), emitPyExpr(v.expression, "scalar"))
    )
  );
  nextBody.push(
    ...ind.exportVars.map((v) =>
      assign(sub(attr(ref("self.lines"), v), lit(0)), sub(attr(ref("self.lines"), `_${v}`), lit(0)))
    )
  );
  const nextFunc: PyFunction = fn("next", ["self"], nextBody);

  const initBody: PyStatement[] = [];
  initBody.push(...ind.indicators.map((v) => assign(attr(ref("self"), v.id), ref(v.pascalName))));
  const initFunc: PyFunction = fn("__init__", ["self"], initBody);

  return cls(
    ind.pascalName,
    fields,
    [initFunc, ...ind.usedAggregations.map(emitAggregationMethod), nextFunc],
    ["bt.indicators.Indicator"]
  );
}
