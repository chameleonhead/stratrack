import { IRProgram } from "../ir/ast";
import { PyModule } from "./ast";
import { emitBtProgramFromIR } from "./emit";

/**
 * IR → PythonProgram 全体変換エントリーポイント
 */
export function convertIrToBtProgramFromIR(ir: IRProgram): PyModule {
  return emitBtProgramFromIR(ir);
}
