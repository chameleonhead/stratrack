import { Declaration } from "../parser/ast";
import { BuiltinSignaturesMap } from "../libs/signatures";

export interface SemanticError {
  message: string;
  line?: number;
  column?: number;
}

export function semanticCheck(
  _ast: Declaration[],
  _builtins: BuiltinSignaturesMap
): SemanticError[] {
  // Placeholder for future semantic analysis
  return [];
}
