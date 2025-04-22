import { IRIndicatorDefinition } from "../../ir/ast";
import { PyClass, PyAssignment, PyStatement, PyFunction } from "../ast";
import { assign, ref, tuple, lit, fn, ret, attr, cls } from "../helper";
import { emitVariableAssign } from "./emitExpr";


export function emitBtIndicatorFromIR(ind: IRIndicatorDefinition): PyClass {
  const fields: PyAssignment[] = [];
  fields.push(assign(ref("lines"), tuple(ind.exportVars.map(lit))));
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

  const initBody: PyStatement[] = [];
  initBody.push(...ind.variables.map(emitVariableAssign));
  const initFunc: PyFunction = fn("__init__", ["self"], initBody);

  const getFuncs: PyFunction[] = ind.exportVars.map((name) =>
    fn(name, ["self"], [ret(attr(ref("self"), name))])
  );

  return cls(ind.pascalName, fields, [initFunc, ...getFuncs], ["bt.indicators.Indicator"]);
}
