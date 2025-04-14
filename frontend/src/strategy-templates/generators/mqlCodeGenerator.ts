import { MqlExpression, MqlFile, MqlFunction, MqlStatement } from "../../codegen/mql/mqlast";
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
import {
  StrategyTemplate,
  VariableExpression,
  Condition,
  ConditionOperand,
  IndicatorExpression,
} from "../types";

import {
  decl,
  ref,
  lit,
  bin,
  stmt,
  ret,
  call,
  callStmt,
  iff,
  loop,
  arg,
  fn,
  ternary,
  unary,
  globalVar,
  file,
  comment,
} from "../../codegen/mql/mqlhelper";

/** 共通関数定義（ポジションのリスト取得 / オープン / クローズ） */
export function generateCommonFunctionDefinitions(): MqlFunction[] {
  return [
    fn(
      "ListOpenPosition",
      "void",
      [
        decl("ticketsCount", "int", lit(0)),
        callStmt("ArrayResize", ["tickets", "ticketsCount"]),
        loop(
          decl("i", "int", bin(call("OrdersTotal", []), "-", lit(1))),
          bin(ref("i"), ">=", lit(0)),
          stmt(unary("--", ref("i"))),
          [
            iff(
              bin(
                bin(
                  call("OrderSelect", [ref("i"), ref("SELECT_BY_POS"), ref("MODE_TRADES")]),
                  "&&",
                  bin(call("OrderSymbol", []), "==", ref("symbol"))
                ),
                "&&",
                bin(call("OrderMagicNumber", []), "==", ref("MagicNumber"))
              ),
              [
                callStmt("ArrayResize", ["tickets", "++ticketsCount"]),
                stmt(bin("tickets[ticketsCount - 1]", "=", call("OrderTicket", []))),
              ]
            ),
          ]
        ),
      ],
      [arg("symbol", "string"), arg("tickets[]", "int&")]
    ),

    fn(
      "OpenOrder",
      "void",
      [
        decl("cmd", "int", ternary('type == "buy"', "OP_BUY", "OP_SELL")),
        callStmt("OrderSend", [
          "Symbol()",
          "cmd",
          "lots",
          "price",
          "3",
          "0",
          "0",
          '""',
          "MagicNumber",
          "0",
          "clrGreen",
        ]),
      ],
      [arg("type", "string"), arg("lots", "double"), arg("price", "double")]
    ),

    fn(
      "CloseOrder",
      "void",
      [
        iff(call("OrderSelect", [ref("ticket"), ref("SELECT_BY_TICKET")]), [
          decl(
            "price",
            "double",
            ternary(bin(call("OrderType", []), "==", ref("OP_BUY")), ref("Bid"), ref("Ask"))
          ),
          callStmt("OrderClose", ["ticket", "OrderLots()", "price", "3", "clrRed"]),
        ]),
      ],
      [arg("ticket", "int")]
    ),
  ];
}

export function generateInitFunction(template: StrategyTemplate): MqlFunction {
  const body: MqlStatement[] = [
    ...(template.variables ?? []).map((v) => callStmt("ArraySetAsSeries", [v.name, "true"])),
    ret(ref("INIT_SUCCEEDED")),
  ];

  return fn("OnInit", "int", body);
}

export function generateDeinitFunction(template: StrategyTemplate): MqlFunction {
  const body: MqlStatement[] = [
    ...(template.variables ?? []).map((v) => callStmt("ArrayFree", [v.name])),
  ];

  return fn("OnDeinit", "void", body, [arg("reason", "const int")]);
}

/** OnTick 関数の生成 */
export function generateTickFunction(template: StrategyTemplate): MqlFunction {
  const stmts: MqlStatement[] = [
    // Bars < 100 チェック
    iff(bin(ref("Bars"), "<", lit(100)), [ret()]),
  ];

  // 変数初期化（配列リサイズ・差分埋め）
  if (template.variables?.length) {
    stmts.push(
      decl("lastBars", "static int", lit(0)),
      decl("currentBars", "int", ref("Bars")),
      decl("diff", "int", bin(ref("currentBars"), "-", ref("lastBars"))),
      iff(bin(ref("diff"), ">", lit(0)), [
        ...template.variables.map((v) => callStmt("ArrayResize", [v.name, "Bars"])),
        loop(
          decl("i", "int", bin(ref("diff"), "-", lit(1))),
          bin(ref("i"), ">=", lit(0)),
          stmt(unary("--", ref("i"))),
          template.variables.map((v) =>
            stmt(bin(ref(`${v.name}[i]`), "=", emitVariableExpression(v.expression)))
          )
        ),
        stmt(bin(ref("lastBars"), "=", ref("currentBars"))),
      ])
    );
  }

  // ポジションチェックとエントリー・イグジット処理
  stmts.push(
    decl("tickets[]", "int"),
    callStmt("ListOpenPosition", ["Symbol()", "tickets"]),
    iff(
      bin(call("ArraySize", [ref("tickets")]), ">", lit(0)),
      [
        loop(
          decl("i", "int", lit(0)),
          bin(ref("i"), "<", call("ArraySize", [ref("tickets")])),
          stmt(unary("++", ref("i"))),
          (template.exit || []).map((rule) =>
            iff(emitCondition(rule.condition), [callStmt("CloseOrder", ["tickets[i]"])])
          )
        ),
      ],
      (template.entry || []).map((e) =>
        iff(emitCondition(e.condition), [
          callStmt("OpenOrder", [
            e.type === "long" ? `"buy"` : `"sell"`,
            "0.1",
            e.type === "long" ? "Ask" : "Bid",
          ]),
        ])
      )
    ),
    callStmt("ArrayFree", ["tickets"])
  );

  return new MqlFunction("OnTick", "void", stmts);
}

/**
 * StrategyTemplate から MQL4 AST ファイルを生成
 */
export function convertStrategyToMqlAst(template: StrategyTemplate): MqlFile {
  const vars = (template.variables ?? []).map((v) => globalVar(`${v.name}[]`, "double"));
  vars.push(globalVar("MagicNumber", "int", "123456"));

  const functions = [
    ...generateCommonFunctionDefinitions(),
    generateInitFunction(template),
    generateDeinitFunction(template),
    generateTickFunction(template),
  ];

  return file("expert", vars, functions, ["show_inputs"], []);
}

function emitVariableExpression(expr: VariableExpression): MqlExpression {
  switch (expr.type) {
    case "constant":
      return [lit(expr.value.toString())];
    case "price": {
      let varName: string;
      switch (expr.source) {
        case "ask":
          varName = "Ask";
          break;
        case "bid":
          varName = "Bid";
          break;
        case "open":
          varName = "Open";
          break;
        case "high":
          varName = "High";
          break;
        case "low":
          varName = "Low";
          break;
        case "close":
          varName = "Close";
          break;
      }

      if (typeof expr.shiftBars == "undefined") {
        return [lit(`${varName}[0]`)];
      }
      return [lit(`${varName}[${expr.shiftBars}]`)];
    }
    case "indicator": {
      return mapIndicatorNameToMqlFunction(expr);
    }
    case "variable":
      return [lit(`${expr.name}[0]`)];
    case "unary_op":
      return [unary(expr.operator, emitVariableExpression(expr.operand))];
    case "binary_op":
      return [
        bin(emitVariableExpression(expr.left), expr.operator, emitVariableExpression(expr.right)),
      ];
    case "ternary":
      return [
        ternary(
          emitCondition(expr.condition),
          emitVariableExpression(expr.trueExpr),
          emitVariableExpression(expr.falseExpr)
        ),
      ];
  }
  return [comment("Unsupported variable type")];
}

function emitCondition(cond: Condition, shift: number = 0): MqlExpression {
  switch (cond.type) {
    case "comparison":
      return `(${emitOperand(cond.left, 0)} ${cond.operator} ${emitOperand(cond.right, 0)})`;
    case "cross": {
      const l_curr = emitOperand(cond.left, shift);
      const l_prev = emitOperand(cond.left, shift + 1);
      const r_curr = emitOperand(cond.right, shift);
      const r_prev = emitOperand(cond.right, shift + 1);
      return cond.direction === "cross_over"
        ? `(${l_prev} < ${r_prev} && ${l_curr} > ${r_curr})`
        : `(${l_prev} > ${r_prev} && ${l_curr} < ${r_curr})`;
    }
    case "state": {
      const conds = [];
      const sign = cond.state === "rising" ? ">" : "<";
      for (let i = 0; i < Math.abs(cond.length || 1); i++) {
        const var_curr = emitOperand(cond.operand, shift + i);
        const var_prev = emitOperand(cond.operand, shift + i + 1);
        conds.push(`${var_curr} ${sign} ${var_prev}`);
      }
      return conds.join(" and ");
    }
    case "continue": {
      const conds = [];
      for (let i = 0; i < Math.abs(cond.length || 2); i++) {
        const condition = emitCondition(cond.condition, shift + i);
        conds.push(condition);
      }
      return `${cond.continue === "true" ? "" : "!"}(${conds.join(" && ")})`;
    }
    case "change": {
      const inner_curr = emitCondition(cond.condition, shift);
      const inner_prev = emitCondition(cond.condition, shift);
      return cond.change === "to_true"
        ? `!(${inner_prev}) && (${inner_curr})`
        : `(${inner_prev}) && !(${inner_curr})`;
    }
    case "group":
      return (
        "(" +
        cond.conditions
          .map((c) => emitCondition(c, shift))
          .join(`) ${cond.operator === "and" ? "&&" : "||"} (`) +
        ")"
      );
    default:
      return "false";
  }
}

function emitOperand(op: ConditionOperand, shift: number): string {
  return op.type === "variable" ? `${op.name}[${shift}]` : `${op.value}`;
}

function mapIndicatorNameToMqlFunction(expr: IndicatorExpression): MqlExpression {
  switch (expr.name) {
    case Accelerator.name:
      return call("iAC", ["Symbol()", "0", "0"]);
    case AccumulationDistribution.name:
      return call("iAD", ["Symbol()", "0", "0"]);
    case ADX.name:
      return call("iADX", [
        "Symbol()",
        "0",
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        expr.params.find((p) => p.name === "period")!.value.toString(),
        expr.lineName === "adx"
          ? "MODE_MAIN"
          : expr.lineName === "pdi"
            ? "MODE_PLUSDI"
            : expr.lineName === "mdi"
              ? "MODE_MINUSDI"
              : "",
        "0",
      ]);
    case Alligator.name:
      return call("iAlligator", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "jawPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "jawShift")!.value.toString(),
        expr.params.find((p) => p.name === "teethPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "teethShift")!.value.toString(),
        expr.params.find((p) => p.name === "lipsPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "lipsShift")!.value.toString(),
        { sma: "MODE_SMA", ema: "MODE_EMA", smma: "MODE_SMMA", lwma: "MODE_LWMA" }[
          expr.params.find((p) => p.name === "method")!.value.toString()
        ] as string,
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        expr.lineName === "jaw"
          ? "MODE_GATORJAW"
          : expr.lineName === "teeth"
            ? "MODE_GATORTEETH"
            : expr.lineName === "lips"
              ? "MODE_GATORLIPS"
              : "",
        "0",
      ]);
    case AwesomeOscillator.name:
      return call("iAO", ["Symbol()", "0", "0"]);
    case ATR.name:
      return call("iATR", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
      ]);
    case BearsPower.name:
      return call("iBearsPower", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case BollingerBands.name:
      return call("iBands", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        expr.params.find((p) => p.name === "deviation")!.value.toString(),
        "0",
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        expr.lineName === "middle"
          ? "MODE_MAIN"
          : expr.lineName === "upper"
            ? "MODE_UPPER"
            : expr.lineName === "lower"
              ? "MODE_LOWER"
              : "",
        "0",
      ]);
    case BullsPower.name:
      return call("iBullsPower", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case CommodityChannelIndex.name:
      return call("iCCI", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case DeMarker.name:
      return call("iDeMarker", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
      ]);
    case Envelopes.name:
      return call("iEnvelopes", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        { sma: "MODE_SMA", ema: "MODE_EMA", smma: "MODE_SMMA", lwma: "MODE_LWMA" }[
          expr.params.find((p) => p.name === "method")!.value.toString()
        ] as string,
        "0",
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        expr.params.find((p) => p.name === "deviation")!.value.toString(),
        expr.lineName === "basis"
          ? "MODE_MAIN"
          : expr.lineName === "upper"
            ? "MODE_UPPER"
            : expr.lineName === "lower"
              ? "MODE_LOWER"
              : "",
        "0",
      ]);
    case ForceIndex.name:
      return call("iForce", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        { sma: "MODE_SMA", ema: "MODE_EMA", smma: "MODE_SMMA", lwma: "MODE_LWMA" }[
          expr.params.find((p) => p.name === "method")!.value.toString()
        ] as string,
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case Fractals.name:
      return call("iFractals", [
        "Symbol()",
        "0",
        expr.lineName === "upFractal"
          ? "MODE_UPPER"
          : expr.lineName === "downFractal"
            ? "MODE_LOWER"
            : "",
        "0",
      ]);
    case GatorOscillator.name:
      return call("iGator", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "jawPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "jawShift")!.value.toString(),
        expr.params.find((p) => p.name === "teethPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "teethShift")!.value.toString(),
        expr.params.find((p) => p.name === "lipsPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "lipsShift")!.value.toString(),
        { sma: "MODE_SMA", ema: "MODE_EMA", smma: "MODE_SMMA", lwma: "MODE_LWMA" }[
          expr.params.find((p) => p.name === "method")!.value.toString()
        ] as string,
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        expr.lineName === "gatorUpper"
          ? "MODE_UPPER"
          : expr.lineName === "gatorLower"
            ? "MODE_LOWER"
            : "",
        "0",
      ]);
    case Ichimoku.name:
      return call("iIchimoku", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "tenkanPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "kijunPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "senkouPeriod")!.value.toString(),
        expr.lineName === "tenkan"
          ? "MODE_TENKANSEN"
          : expr.lineName === "kijun"
            ? "MODE_KIJUNSEN"
            : expr.lineName === "senkouA"
              ? "MODE_SENKOUSPANA"
              : expr.lineName === "senkouB"
                ? "MODE_SENKOUSPANB"
                : expr.lineName === "chikou"
                  ? "MODE_CHIKOUSPAN"
                  : "",
        "0",
      ]);
    case MarketFacilitationIndex.name:
      return call("iBWMFI", ["Symbol()", "0", "0"]);
    case Momentum.name:
      return call("iMomentum", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case MoneyFlowIndex.name:
      return call("iMFI", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
      ]);
    case MA.name:
      return call("iMA", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
        { sma: "MODE_SMA", ema: "MODE_EMA", smma: "MODE_SMMA", lwma: "MODE_LWMA" }[
          expr.params.find((p) => p.name === "method")!.value.toString()
        ] as string,
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case MACDHistogram.name:
      return call("iOsMA", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "fastPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "slowPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "signalPeriod")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case MACD.name:
      return call("iMACD", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "fastPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "slowPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "signalPeriod")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        expr.lineName === "macd" ? "MODE_MAIN" : expr.lineName === "signal" ? "MODE_SIGNAL" : "",
        "0",
      ]);
    case OnBalanceVolume.name:
      return call("iOBV", [
        "Symbol()",
        "0",
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case RSI.name:
      return call("iRSI", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case RelativeVigorIndex.name:
      return call("iRVI", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        expr.lineName === "rvi" ? "MODE_MAIN" : expr.lineName === "signal" ? "MODE_SIGNAL" : "",
        "0",
      ]);
    case StandardDeviation.name:
      return call("iStdDev", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
        { sma: "MODE_SMA", ema: "MODE_EMA", smma: "MODE_SMMA", lwma: "MODE_LWMA" }[
          expr.params.find((p) => p.name === "method")!.value.toString()
        ] as string,
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case Stochastic.name:
      return call("iStochastic", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "kPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "dPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "slowing")!.value.toString(),
        { sma: "MODE_SMA", ema: "MODE_EMA", smma: "MODE_SMMA", lwma: "MODE_LWMA" }[
          expr.params.find((p) => p.name === "method")!.value.toString()
        ] as string,
        "0",
        expr.lineName === "k" ? "MODE_MAIN" : expr.lineName === "d" ? "MODE_SIGNAL" : "",
        "0",
      ]);
    case WilliamsPercentRange.name:
      return call("iWPR", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
      ]);
  }

  return call("iCustom", ["Symbol()", "0", "0"]);
}

function mapSourceToMqlExpression(source: string): MqlExpression {
  const map: Record<string, string> = {
    close: "PRICE_CLOSE",
    open: "PRICE_OPEN",
    high: "PRICE_HIGH",
    low: "PRICE_LOW",
    median: "PRICE_MEDIAN",
    typical: "PRICE_TYPICAL",
    weighted: "PRICE_WEIGHTED",
  };
  const mapped = map[source];
  // if (!mapped) throw new Error(`Unknown source type: ${source}`);
  return lit(mapped);
}
