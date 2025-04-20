import { IRProgram } from "../ir/ast";
import { MqlProgram } from "./ast";
import { emitMqlEaFromIR } from "./emit";

/**
 * IR → MqlProgram 全体変換エントリーポイント
 */
export function convertIrToMqlProgram(ir: IRProgram): MqlProgram {
  return emitMqlEaFromIR(ir);
}
