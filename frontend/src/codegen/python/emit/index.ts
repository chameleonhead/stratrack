import { IRProgram } from "../../ir/ast";
import { PyModule } from "../ast";
import { mod } from "../helper";
import { emitBtIndicatorFromIR } from "./emitIndicator";
import { emitBtStrategyFromIR } from "./emitStrategy";

export function emitBtProgramFromIR(program: IRProgram): PyModule {
  const indicators = program.indicatorDefs.map(emitBtIndicatorFromIR);
  const strategy = emitBtStrategyFromIR(program.strategy);

  return mod(
    [...indicators, strategy],
    [
      "import backtrader as bt",
      "from backtrader.indicators import *",
      "from backtrader.functions import crossover, crossunder",
    ]
  );
}
