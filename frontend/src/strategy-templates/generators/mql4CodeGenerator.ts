// StrategyTemplate to MQL AST converter + MQL4 renderer

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

export class MqlFile {
  constructor(
    public type: "expert" | "indicator",
    public globalVars: MqlGlobalVariable[],
    public functions: MqlFunction[],
    public properties: string[] = [],
    public buffers: MqlIndexBuffer[] = []
  ) {}

  toString(): string {
    const lines: string[] = [];
    lines.push(...this.properties.map((p) => `#property ${p}`));
    lines.push("#property strict\n");
    for (const buf of this.buffers) {
      lines.push(`double ${buf.name}[];`);
    }
    for (const v of this.globalVars) {
      lines.push(`${v.type} ${v.name};`);
    }
    for (const fn of this.functions) {
      lines.push("\n" + fn.toString());
    }
    return lines.join("\n");
  }
}

export class MqlGlobalVariable {
  constructor(
    public name: string,
    public type: string,
    public init?: string
  ) {}
}

export class MqlFunction {
  constructor(
    public name: string,
    public returnType: string,
    public body: MqlStatement[],
    public args: MqlArgument[] = []
  ) {}

  toString(): string {
    const header = `${this.returnType} ${this.name}(${this.args.map((a) => `${a.type} ${a.name}`).join(", ")})`;
    const bodyStr = this.body.map((stmt) => stmt.toString("  ")).join("\n");
    return `${header} {\n${bodyStr}\n}`;
  }
}

export class MqlArgument {
  constructor(
    public name: string,
    public type: string
  ) {}
}

export class MqlIndexBuffer {
  constructor(
    public index: number,
    public name: string,
    public style?: string,
    public label?: string
  ) {}
}
export abstract class MqlExpression {
  abstract toString(): string;
}

export class MqlLiteral extends MqlExpression {
  constructor(public value: string) {
    super();
  }
  toString(): string {
    return this.value;
  }
}

export class MqlVariableRef extends MqlExpression {
  constructor(public name: string) {
    super();
  }
  toString(): string {
    return this.name;
  }
}

export class MqlUnaryExpr extends MqlExpression {
  constructor(
    public operator: string,
    public value: MqlExpression
  ) {
    super();
  }
  toString(): string {
    return `${this.operator} ${this.value.toString()}`;
  }
}

export class MqlBinaryExpr extends MqlExpression {
  constructor(
    public left: MqlExpression,
    public operator: string,
    public right: MqlExpression
  ) {
    super();
  }
  toString(): string {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}

export class MqlTernaryExpr extends MqlExpression {
  constructor(
    public condition: MqlExpression,
    public trueExpr: MqlExpression,
    public falseExpr: MqlExpression
  ) {
    super();
  }
  toString(): string {
    return `${this.condition.toString()} ? ${this.trueExpr.toString()} : ${this.falseExpr.toString()}`;
  }
}

export class MqlFunctionCallExpr extends MqlExpression {
  constructor(
    public name: string,
    public args: MqlExpression[]
  ) {
    super();
  }
  toString(): string {
    return `${this.name}(${this.args.map((a) => a.toString()).join(", ")})`;
  }
}

// ----------------- Statement Types -----------------

export abstract class MqlStatement {
  abstract toString(indent?: string): string;
}

export class MqlExprStatement extends MqlStatement {
  constructor(public expr: MqlExpression) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}${this.expr.toString()};`;
  }
}

export class MqlDecl extends MqlStatement {
  constructor(
    public name: string,
    public varType: string,
    public init?: MqlExpression
  ) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}${this.varType} ${this.name}${this.init ? ` = ${this.init.toString()}` : ""};`;
  }
}

export class MqlIf extends MqlStatement {
  constructor(
    public condition: MqlExpression,
    public then: MqlStatement[],
    public elseBranch?: MqlStatement[]
  ) {
    super();
  }
  toString(indent = "  "): string {
    const lines = [`${indent}if (${this.condition.toString()}) {`];
    lines.push(...this.then.map((s) => s.toString(indent + "  ")));
    if (this.elseBranch) {
      lines.push(`${indent}} else {`);
      lines.push(...this.elseBranch.map((s) => s.toString(indent + "  ")));
    }
    lines.push(`${indent}}`);
    return lines.join("\n");
  }
}

export class MqlReturn extends MqlStatement {
  constructor(public expr?: MqlExpression) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}return${this.expr ? ` ${this.expr.toString()}` : ""};`;
  }
}

export class MqlFor extends MqlStatement {
  constructor(
    public init: MqlStatement, // 通常 MqlDecl or MqlExprStatement
    public condition: MqlExpression,
    public increment: MqlStatement,
    public body: MqlStatement[]
  ) {
    super();
  }
  toString(indent = "  "): string {
    const initStr =
      this.init instanceof MqlExprStatement || this.init instanceof MqlDecl
        ? this.init.toString("").replace(/;$/, "")
        : this.init.toString("");

    const incrementStr =
      this.increment instanceof MqlExprStatement
        ? this.increment.toString("").replace(/;$/, "")
        : this.increment.toString("");

    const lines = [`${indent}for (${initStr}; ${this.condition.toString()}; ${incrementStr}) {`];
    lines.push(...this.body.map((stmt) => stmt.toString(indent + "  ")));
    lines.push(`${indent}}`);
    return lines.join("\n");
  }
}

// --- Statement and Expression Types ---

export class MqlComment extends MqlStatement {
  constructor(public text: string) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}// ${this.text}`;
  }
}

export class MqlWhile extends MqlStatement {
  constructor(
    public condition: string,
    public body: MqlStatement[]
  ) {
    super();
  }

  toString(indent = "  "): string {
    const lines = [`${indent}while (${this.condition}) {`];
    lines.push(...this.body.map((stmt) => stmt.toString(indent + "  ")));
    lines.push(`${indent}}`);
    return lines.join("\n");
  }
}

export class MqlBlock extends MqlStatement {
  constructor(public body: MqlStatement[]) {
    super();
  }
  toString(indent = "  ") {
    const lines = [`${indent}{`];
    lines.push(...this.body.map((stmt) => stmt.toString(indent + "  ")));
    lines.push(`${indent}}`);
    return lines.join("\n");
  }
}

export class MqlFunctionCall extends MqlStatement {
  constructor(
    public name: string,
    public args: string[]
  ) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}${this.name}(${this.args.join(", ")});`;
  }
}

export class MqlStruct extends MqlStatement {
  constructor(
    public name: string,
    public fields: MqlGlobalVariable[]
  ) {
    super();
  }
  toString(indent = "  ") {
    const lines = [`${indent}struct ${this.name} {`];
    for (const f of this.fields) {
      lines.push(`${indent}  ${f.type} ${f.name};`);
    }
    lines.push(`${indent}};`);
    return lines.join("\n");
  }
}

export function generateCommonFunctionDefinitions(): MqlFunction[] {
  return [
    new MqlFunction(
      "ListOpenPosition",
      "void",
      [
        new MqlDecl("ticketsCount", "int", "0"),
        new MqlExprStatement("ArrayResize(tickets, ticketsCount)"),
        new MqlFor("int i = OrdersTotal() - 1", "i >= 0", "i--", [
          new MqlIf(
            "OrderSelect(i, SELECT_BY_POS, MODE_TRADES) && OrderSymbol() == symbol && OrderMagicNumber() == MagicNumber",
            [
              new MqlExprStatement("ArrayResize(tickets, ++ticketsCount)"),
              new MqlExprStatement("tickets[ticketsCount - 1] = OrderTicket()"),
            ]
          ),
        ]),
      ],
      [new MqlArgument("symbol", "string"), new MqlArgument("tickets[]", "int&")]
    ),
    new MqlFunction(
      "OpenOrder",
      "void",
      [
        new MqlDecl("cmd", "int", 'type == "buy" ? OP_BUY : OP_SELL'),
        new MqlFunctionCall("OrderSend", [
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
      [
        new MqlArgument("type", "string"),
        new MqlArgument("lots", "double"),
        new MqlArgument("price", "double"),
      ]
    ),
    new MqlFunction(
      "CloseOrder",
      "void",
      [
        new MqlIf("OrderSelect(ticket, SELECT_BY_TICKET)", [
          new MqlDecl("price", "double", "OrderType() == OP_BUY ? Bid : Ask"),
          new MqlFunctionCall("OrderClose", ["ticket", "OrderLots()", "price", "3", "clrRed"]),
        ]),
      ],
      [new MqlArgument("ticket", "int")]
    ),
  ];
}

// --- Utility Renderer (optional for use outside toString) ---
export function renderStatement(stmt: MqlStatement): string[] {
  return stmt.toString().split("\n");
}

export function convertStrategyToMql4Ast(template: StrategyTemplate): MqlFile {
  const vars = (template.variables || []).map(
    (v) => new MqlGlobalVariable(`${v.name}[]`, "double")
  );
  vars.push(new MqlGlobalVariable("MagicNumber", "int", "123456"));

  const initBody: MqlStatement[] = [
    ...(template.variables?.map((v) => new MqlExprStatement(`ArraySetAsSeries(${v.name}, true)`)) ||
      []),
    new MqlReturn("INIT_SUCCEEDED"),
  ];

  const deinitBody: MqlStatement[] = [
    ...(template.variables?.map((v) => new MqlExprStatement(`ArrayFree(${v.name})`)) || []),
  ];

  const tickBody: MqlStatement[] = [new MqlIf("Bars < 100", [new MqlReturn()])];

  // 変数初期化
  if (template.variables && template.variables.length > 0) {
    tickBody.push(
      // static int lastBars = 0;
      new MqlDecl("lastBars", "static int", new MqlLiteral("0")),

      // int currentBars = Bars;
      new MqlDecl("currentBars", "int", new MqlVariableRef("Bars")),

      // int diff = currentBars - lastBars;
      new MqlDecl(
        "diff",
        "int",
        new MqlBinaryExpr(new MqlVariableRef("currentBars"), "-", new MqlVariableRef("lastBars"))
      ),

      // if (diff > 0) { ... }
      new MqlIf(new MqlBinaryExpr(new MqlVariableRef("diff"), ">", new MqlLiteral("0")), [
        ...template.variables.map((v) => {
          return new MqlFunctionCall("ArrayResize", [v.name, "Bars"]);
        }),
        // for (int i = diff - 1; i >= 0; i--)
        new MqlFor(
          new MqlDecl(
            "i",
            "int",
            new MqlBinaryExpr(new MqlVariableRef("diff"), "-", new MqlLiteral("1"))
          ),
          new MqlBinaryExpr(new MqlVariableRef("i"), ">=", new MqlLiteral("0")),
          new MqlExprStatement(new MqlUnaryExpr("--", new MqlVariableRef("i"))),
          template.variables.map((v) => {
            return new MqlExprStatement(
              new MqlBinaryExpr(`${v.name}[i]`, "=", emitVariableExpression(v.expression))
            );
          })
        ),

        // lastBars = currentBars;
        new MqlExprStatement(
          new MqlBinaryExpr(new MqlVariableRef("lastBars"), "=", new MqlVariableRef("currentBars"))
        ),
      ])
    );
  }

  // ポジションチェック
  tickBody.push(
    new MqlDecl("tickets[]", "int"),
    new MqlFunctionCall("ListOpenPosition", ["Symbol()", "tickets"]),
    new MqlIf(
      "ArraySize(tickets) > 0",
      // ポジションあり: イグジット条件評価
      [
        new MqlFor(
          "int i = 0",
          "i < ArraySize(tickets)",
          "i++",
          (template.exit || []).map(
            (x) =>
              new MqlIf(emitCondition(x.condition), [
                new MqlFunctionCall("CloseOrder", ["tickets[i]"]),
              ])
          )
        ),
      ],
      // ポジションなし: エントリー条件評価
      (template.entry || []).map(
        (e) =>
          new MqlIf(emitCondition(e.condition), [
            new MqlFunctionCall("OpenOrder", [
              e.type === "long" ? `"buy"` : `"sell"`,
              "0.1",
              e.type === "long" ? "Ask" : "Bid",
            ]),
          ])
      )
    ),
    new MqlExprStatement("ArrayFree(tickets)")
  );

  return new MqlFile(
    "expert",
    vars,
    [
      ...generateCommonFunctionDefinitions(),
      new MqlFunction("OnInit", "int", initBody),
      new MqlFunction("OnDeinit", "void", deinitBody, [new MqlArgument("reason", "const int")]),
      new MqlFunction("OnTick", "void", tickBody),
    ],
    ["show_inputs"],
    []
  );
}

function emitVariableExpression(expr: VariableExpression): MqlExpression {
  switch (expr.type) {
    case "constant":
      return [new MqlLiteral(expr.value.toString())];
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
        return [new MqlLiteral(`${varName}[0]`)];
      }
      return [new MqlLiteral(`${varName}[${expr.shiftBars}]`)];
    }
    case "indicator": {
      return mapIndicatorNameToMqlFunction(expr);
    }
    case "variable":
      return [new MqlLiteral(`${expr.name}[0]`)];
    case "unary_op":
      return [new MqlUnaryExpr(expr.operator, emitVariableExpression(expr.operand))];
    case "binary_op":
      return [
        new MqlBinaryExpr(
          emitVariableExpression(expr.left),
          expr.operator,
          emitVariableExpression(expr.right)
        ),
      ];
    case "ternary":
      return [
        new MqlTernaryExpr(
          emitCondition(expr.condition),
          emitVariableExpression(expr.trueExpr),
          emitVariableExpression(expr.falseExpr)
        ),
      ];
  }
  return [new MqlComment("Unsupported variable type")];
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
      return new MqlFunctionCallExpr("iAC", ["Symbol()", "0", "0"]);
    case AccumulationDistribution.name:
      return new MqlFunctionCallExpr("iAD", ["Symbol()", "0", "0"]);
    case ADX.name:
      return new MqlFunctionCallExpr("iADX", [
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
      return new MqlFunctionCallExpr("iAlligator", [
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
      return new MqlFunctionCallExpr("iAO", ["Symbol()", "0", "0"]);
    case ATR.name:
      return new MqlFunctionCallExpr("iATR", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
      ]);
    case BearsPower.name:
      return new MqlFunctionCallExpr("iBearsPower", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case BollingerBands.name:
      return new MqlFunctionCallExpr("iBands", [
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
      return new MqlFunctionCallExpr("iBullsPower", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case CommodityChannelIndex.name:
      return new MqlFunctionCallExpr("iCCI", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case DeMarker.name:
      return new MqlFunctionCallExpr("iDeMarker", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
      ]);
    case Envelopes.name:
      return new MqlFunctionCallExpr("iEnvelopes", [
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
      return new MqlFunctionCallExpr("iForce", [
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
      return new MqlFunctionCallExpr("iFractals", [
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
      return new MqlFunctionCallExpr("iGator", [
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
      return new MqlFunctionCallExpr("iIchimoku", [
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
      return new MqlFunctionCallExpr("iBWMFI", ["Symbol()", "0", "0"]);
    case Momentum.name:
      return new MqlFunctionCallExpr("iMomentum", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case MoneyFlowIndex.name:
      return new MqlFunctionCallExpr("iMFI", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
      ]);
    case MA.name:
      return new MqlFunctionCallExpr("iGator", [
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
      return new MqlFunctionCallExpr("iOsMA", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "fastPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "slowPeriod")!.value.toString(),
        expr.params.find((p) => p.name === "signalPeriod")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case MACD.name:
      return new MqlFunctionCallExpr("iMACD", [
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
      return new MqlFunctionCallExpr("iOBV", [
        "Symbol()",
        "0",
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case RSI.name:
      return new MqlFunctionCallExpr("iRSI", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        mapSourceToMqlExpression(expr.params.find((p) => p.name === "source")!.value as string),
        "0",
      ]);
    case RelativeVigorIndex.name:
      return new MqlFunctionCallExpr("iRVI", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        expr.lineName === "rvi" ? "MODE_MAIN" : expr.lineName === "signal" ? "MODE_SIGNAL" : "",
        "0",
      ]);
    case StandardDeviation.name:
      return new MqlFunctionCallExpr("iStdDev", [
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
      return new MqlFunctionCallExpr("iStochastic", [
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
      return new MqlFunctionCallExpr("iWPR", [
        "Symbol()",
        "0",
        expr.params.find((p) => p.name === "period")!.value.toString(),
        "0",
      ]);
  }

  return new MqlFunctionCallExpr("iCustom", ["Symbol()", "0", "0"]);
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
  return new MqlLiteral(mapped);
}
