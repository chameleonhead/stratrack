import { StrategyTemplate } from "../types";
import { convertStrategyToMql4Ast } from "./mql4CodeGenerator";
import { convertStrategyToPythonAst } from "./pythonCodeGenerator";

export function renderStrategyCode(language: string, template: StrategyTemplate): string {
  if (language === "python") {
    const ast = convertStrategyToPythonAst(template);
    return ast.toString();
  }
  if (language === "mql4") {
    const ast = convertStrategyToMql4Ast(template);
    return ast.toString();
  }
  return "";
}
