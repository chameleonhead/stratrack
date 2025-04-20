import { IRIndicatorDefinition } from "../../ir/ast";
import { PyStatement, PyClass, PyFunction } from "../ast";
import { attr, ref, func, ret, cls } from "../helper";
import { emitVariableAssign } from "./emitExpr";

export function emitBtIndicatorFromIR(ind: IRIndicatorDefinition): PyClass {
  const initBody: PyStatement[] = ind.variables.map(emitVariableAssign);

  const initFunc: PyFunction = func("__init__", ["self"], initBody);

  const getFuncs: PyFunction[] = ind.exportVars.map((name) =>
    func(name, ["self"], [ret(attr(ref("self"), name))])
  );

  return cls(ind.pascalName, [initFunc, ...getFuncs]);
}
