import { StrategyTemplate } from "../types";
import { convertStrategyToMqlAst } from "./mqlCodeGenerator";
import { convertStrategyToPythonAst } from "./pythonCodeGenerator";

export function renderStrategyCode(language: string, template: StrategyTemplate): string {
  if (language === "python") {
    const ast = convertStrategyToPythonAst(template);
    return ast.toString();
  }
  if (language === "mql4") {
    const ast = convertStrategyToMqlAst(template);
    return ast.toString();
  }
  return "";
}
