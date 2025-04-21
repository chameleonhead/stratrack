import { IRIndicatorDefinition } from "../../ir/ast";
import { PyStatement, PyClass, PyFunction, PyAssignment } from "../ast";
import { attr, ref, func, ret, cls, lit, assign, tuple } from "../helper";
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
  const initFunc: PyFunction = func("__init__", ["self"], initBody);

  const getFuncs: PyFunction[] = ind.exportVars.map((name) =>
    func(name, ["self"], [ret(attr(ref("self"), name))])
  );

  return cls(ind.pascalName, fields, [initFunc, ...getFuncs], ["bt.indicators.Indicator"]);
}
