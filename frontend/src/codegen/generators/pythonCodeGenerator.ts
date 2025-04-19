import {
  PyModule,
  PyImport,
  PyClass,
  PyFunction,
  PyAssignment,
  PyIf,
  PyExpr,
  PyReturn,
} from "../ast/python/pythonast";
import {
  AggregationType,
  ArrayExpression,
  ArrayOperand,
  Condition,
  IndicatorExpression,
  ScalarExpression,
  ScalarOperand,
} from "../dsl/common";
import { StrategyCondition, StrategyTemplate } from "../dsl/strategy";
import {
  Accelerator,
  AccumulationDistribution,
  ADX,
  Alligator,
  AwesomeOscillator,
  ATR,
  BearsPower,
  BollingerBands,
  BullsPower,
  CommodityChannelIndex,
  DeMarker,
  Envelopes,
  ForceIndex,
  Fractals,
  GatorOscillator,
  Ichimoku,
  MarketFacilitationIndex,
  Momentum,
  MoneyFlowIndex,
  MA,
  MACDHistogram,
  MACD,
  OnBalanceVolume,
  RSI,
  RelativeVigorIndex,
  StandardDeviation,
  Stochastic,
  WilliamsPercentRange,
} from "../../indicators/indicators";

export function convertStrategyToPythonAst(template: StrategyTemplate) {
  const module = new PyModule().addImport(new PyImport("backtrader", ["bt"]));

  const cls = new PyClass("GeneratedStrategy", "bt.Strategy");
  const initFn = new PyFunction("__init__", ["self"]);

  initFn.add(new PyAssignment("self.order_history", "[]"));
  initFn.add(new PyAssignment("self.trade_history", "[]"));
  // Render variable definitions (indicators etc.)
  (template.variables || []).forEach((v) => {
    const varname = ["close"].includes(v.name) ? "__data_{v.name}" : v.name;
    const expr = emitVariableExpression(v.expression);
    initFn.add(new PyAssignment(`self.${varname}`, expr));
  });
  initFn.add(new PyAssignment("self.order", "None"));

  // Render notify_order() method
  const notifyOrderFn = new PyFunction("notify_order", ["self", "order"]);

  const orderStatusIf = new PyIf(
    "order.status in [order.Completed, order.Canceled, order.Rejected]"
  );
  orderStatusIf.add(new PyExpr("self.order_history.append(order)"));
  orderStatusIf.add(new PyAssignment("self.order", "None"));
  notifyOrderFn.add(orderStatusIf);

  // Render notify_trade() method
  const notifyTradeFn = new PyFunction("notify_trade", ["self", "trade"]);

  const tradeStatusIf = new PyIf("trade.isclosed");
  tradeStatusIf.add(new PyExpr("self.trade_history.append(trade)"));
  notifyTradeFn.add(tradeStatusIf);

  // Render next() method
  const nextFn = new PyFunction("next", ["self"]);

  const orderIf = new PyIf("self.order");
  orderIf.add(new PyReturn());
  nextFn.add(orderIf);

  const entryIf = new PyIf("not self.position");
  for (const entry of template.entry) {
    const condStr = emitCondition(entry.condition);
    const entryBlock = new PyIf(condStr);
    if (entry.type === "long") {
      entryBlock.add(new PyExpr("self.order = self.buy()"));
    } else {
      entryBlock.add(new PyExpr("self.order = self.sell()"));
    }
    entryIf.add(entryBlock);
  }

  nextFn.add(entryIf);

  const exitIf = new PyIf("self.position and self.position.size > 0");
  for (const exit of template.exit) {
    const condStr = emitCondition(exit.condition);
    const exitBlock = new PyIf(condStr);
    exitBlock.add(new PyExpr("self.order = self.close()"));
    exitIf.add(exitBlock);
  }

  nextFn.add(exitIf);

  cls.add(initFn);
  cls.add(notifyOrderFn);
  cls.add(notifyTradeFn);
  cls.add(nextFn);
  module.add(cls);
  return module;
}

function emitArrayVariableExpression(expr: ArrayExpression) {
  switch (expr.type) {
    case "price": {
      const source = expr.source || "close";
      return `self.data.${source}`;
    }
    default:
      return "0";
  }
}

function emitVariableExpression(expr: ScalarExpression<StrategyCondition> | ArrayExpression, shift?: PyExpr): string {
  switch (expr.type) {
    case "variable":
      return `this.${expr.name}`;
    case "price": {
      if (expr.valueType === "bar") {
        const source = expr.source || "close";
        return `self.data.${source}`;
      } else {
        const source = expr.source || "close";
        const shiftBars = typeof expr.shiftBars === 'undefined' ? shift : `${emitVariableExpression(expr.shiftBars)} + ${shift}`;
        return shiftBars?.toString() === "0" ? `self.data.${source}[0]` : `self.data.${source}[-${shiftBars}]`;
      }
    }
    case "constant":
      return expr.value.toString();
    case "indicator": {
      return mapIndicatorNameToBtFunction(expr as IndicatorExpression);
    }
    case "bar_value":
      return `${emitArrayVariableExpression(expr.source as ArrayExpression)}[${expr.shiftBars ? emitVariableExpression(expr.shiftBars) : "0"}]`;
    case "unary_op": {
      const inner = emitVariableExpression(expr.operand);
      return expr.operator === "abs" ? `abs(${inner})` : `-${inner}`;
    }
    case "binary_op": {
      const left = emitVariableExpression(expr.left);
      const right = emitVariableExpression(expr.right);
      return `(${left} ${expr.operator} ${right})`;
    }
    case "ternary": {
      const cond = emitCondition(expr.condition);
      const t = emitVariableExpression(expr.trueExpr);
      const f = emitVariableExpression(expr.falseExpr);
      return `(${t} if ${cond} else ${f})`;
    }
    default:
      return "0";
  }
}

function emitCondition(cond: Condition<ScalarOperand, ArrayOperand>, shift: PyExpr = new PyExpr("0")): string {
  switch (cond.type) {
    case "comparison":
      return `${emitVariableExpression(cond.left, shift)} ${cond.operator} ${emitVariableExpression(cond.right, shift)}`;
    case "cross": {
      const l_curr = emitVariableExpression(cond.left, shift);
      const l_prev = emitVariableExpression(cond.left, new PyExpr(`${shift} + 1`));
      const r_curr = emitVariableExpression(cond.right, shift);
      const r_prev = emitVariableExpression(cond.right, new PyExpr(`${shift} + 1`));
      if (cond.direction === "cross_over") {
        return `${l_prev} < ${r_prev} and ${l_curr} > ${r_curr}`;
      } else {
        return `${l_prev} > ${r_prev} and ${l_curr} < ${r_curr}`;
      }
    }
    case "state": {
      const conds = [];
      const sign = cond.state === "rising" ? ">" : "<";
      for (let i = 0; i < Math.abs(cond.consecutiveBars || 1); i++) {
        const var_curr = emitVariableExpression(cond.operand, new PyExpr(`${shift} + ${i}`));
        const var_prev = emitVariableExpression(cond.operand, new PyExpr(`${shift} + ${i} + 1`));
        conds.push(`${var_curr} ${sign} ${var_prev}`);
      }
      return conds.join(" and ");
    }
    case "continue": {
      const conds = [];
      for (let i = 0; i < Math.abs(cond.consecutiveBars || 2); i++) {
        const condition = emitCondition(cond.condition, new PyExpr(`${shift} + ${i}`));
        conds.push(condition);
      }
      return `${cond.continue === "true" ? "" : "not "}(${conds.join(" and ")})`;
    }
    case "change": {
      const inner_curr = emitCondition(cond.condition, shift);
      const inner_prev = emitCondition(cond.condition, shift);
      return cond.change === "to_true"
        ? `not (${inner_prev}) and (${inner_curr})`
        : `(${inner_prev}) and not (${inner_curr})`;
    }
    case "group":
      return (
        "(" + cond.conditions.map((c) => emitCondition(c, shift)).join(`) ${cond.operator} (`) + ")"
      );
    default:
      return "False";
  }
}
function mapIndicatorNameToBtFunction(expr: IndicatorExpression): string {
  const getNumber = (name: string): number =>
    expr.params.filter((p) => p.type === "number").find((p) => p.name === name)?.value as number;
  const getMethod = (name: string): AggregationType =>
    expr.params.filter((p) => p.type === "aggregationType").find((p) => p.name === name)
      ?.method as AggregationType;

  const line = expr.lineName ?? "";

  switch (expr.name) {
    case Accelerator.name:
      return `bt.indicators.AccDeOsc()`;

    case AccumulationDistribution.name:
      if (line === "ad") return `bt.indicators.AccDist(self.data).ad`;
      break;

    case ADX.name:
      if (line === "adx") return `bt.indicators.ADX(self.data, period=${getNumber("period")}).adx`;
      if (line === "pdi")
        return `bt.indicators.PlusDI(self.data, period=${getNumber("period")}).plusDI`;
      if (line === "mdi")
        return `bt.indicators.MinusDI(self.data, period=${getNumber("period")}).minusDI`;
      break;

    case Alligator.name:
      throw new Error("failed");
    case AwesomeOscillator.name:
      throw new Error("failed");

    case ATR.name:
      if (line === "atr") return `bt.indicators.ATR(self.data, period=${getNumber("period")}).atr`;
      break;

    case BearsPower.name:
      throw new Error("failed");

    case BollingerBands.name:
      if (line === "upper")
        return `bt.indicators.BollingerBands(self.data, period=${getNumber("period")}, devfactor=${getNumber("deviation")}).top`;
      if (line === "middle")
        return `bt.indicators.BollingerBands(self.data, period=${getNumber("period")}, devfactor=${getNumber("deviation")}).mid`;
      if (line === "lower")
        return `bt.indicators.BollingerBands(self.data, period=${getNumber("period")}, devfactor=${getNumber("deviation")}).bot`;
      break;

    case BullsPower.name:
      throw new Error("failed");
    case CommodityChannelIndex.name:
      if (line === "cci") return `bt.indicators.CCI(self.data, period=${getNumber("period")}).cci`;
      break;

    case DeMarker.name:
      throw new Error("failed");
    case Envelopes.name:
      throw new Error("failed");
    case ForceIndex.name:
      if (line === "force")
        return `bt.indicators.ForceIndex(self.data, period=${getNumber("period")}).force`;
      break;
    case Fractals.name:
      throw new Error("fail");

    case GatorOscillator.name:
      throw new Error("fail");
    case Ichimoku.name:
      throw new Error("fail");
    case MarketFacilitationIndex.name:
      throw new Error("fail");
    case Momentum.name:
      if (line === "momentum")
        return `bt.indicators.Momentum(self.data, period=${getNumber("period")}).momentum`;
      break;
    case MoneyFlowIndex.name:
      if (line === "mfi")
        return `bt.talib.MFI(self.data.high, self.data.low, self.data.close, self.data.volume, timeperiod=${getNumber("period")})`;
      break;
    case MA.name:
      if (line === "ma") {
        const method = getMethod("method");
        if (method === "ema")
          return `bt.indicators.EMA(self.data, period=${getNumber("period")}).ema`;
        if (method === "sma")
          return `bt.indicators.SMA(self.data, period=${getNumber("period")}).sma`;
        return `bt.indicators.SMA(self.data, period=${getNumber("period")}).sma`;
      }
      break;
    case MACDHistogram.name:
      if (line === "histogram")
        return `bt.indicators.MACD(self.data, period_me1=${getNumber("fastPeriod")}, period_me2=${getNumber("slowPeriod")}, period_signal=${getNumber("signalPeriod")}).histogram`;
      break;
    case MACD.name:
      if (line === "macd")
        return `bt.indicators.MACD(self.data, period_me1=${getNumber("fastPeriod")}, period_me2=${getNumber("slowPeriod")}, period_signal=${getNumber("signalPeriod")}).macd`;
      if (line === "signal")
        return `bt.indicators.MACD(self.data, period_me1=${getNumber("fastPeriod")}, period_me2=${getNumber("slowPeriod")}, period_signal=${getNumber("signalPeriod")}).signal`;
      break;
    case OnBalanceVolume.name:
      if (line === "obv") return `bt.indicators.OBV(self.data).obv`;
      break;
    case RSI.name:
      if (line === "rsi") return `bt.indicators.RSI(self.data, period=${getNumber("period")}).rsi`;
      break;
    case RelativeVigorIndex.name:
      if (line === "rvi") return `bt.indicators.RVI(self.data, period=${getNumber("period")}).rvi`;
      if (line === "signal")
        return `bt.indicators.RVI(self.data, period=${getNumber("period")}).signal`;
      break;

    case StandardDeviation.name:
      if (line === "stddev")
        return `bt.indicators.StdDev(self.data, period=${getNumber("period")}).stddev`;
      break;

    case Stochastic.name:
      if (line === "k")
        return `bt.indicators.Stochastic(self.data, period=${getNumber("kPeriod")}).percK`;
      if (line === "d")
        return `bt.indicators.Stochastic(self.data, period=${getNumber("kPeriod")}).percD`;
      break;

    case WilliamsPercentRange.name:
      if (line === "percentR")
        return `bt.indicators.WilliamsR(self.data, period=${getNumber("period")}).r`;
      break;
  }

  return `# unsupported or missing line: ${expr.name} [line: ${line}]`;
}
