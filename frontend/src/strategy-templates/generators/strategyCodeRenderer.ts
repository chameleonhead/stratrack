import { Indicator } from "../../indicators/types";
import { StrategyTemplate } from "../types";
import { convertStrategyToMqlAst } from "./mqlEaGenerator";
import { convertStrategyToPythonAst } from "./pythonCodeGenerator";

export function renderStrategyCode(
  language: string,
  template: StrategyTemplate,
  indicators: Indicator[]
): string {
  if (language === "python") {
    const ast = convertStrategyToPythonAst(template);
    return ast.toString();
  }
  if (language === "mql4") {
    const ast = convertStrategyToMqlAst(template, indicators);
    return ast.toString();
  }
  return "";
}
