import { MqlExpression, MqlFile, MqlFunction, MqlStatement } from "../../codegen/mql/mqlast";
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
} from "../../codegen/mql/mqlhelper";
import { Condition, ConditionOperand, VariableExpression } from "../../dsl/common";
import { Indicator } from "../../dsl/indicator";
import { StrategyTemplate } from "../../dsl/strategy";
import { IndicatorContext } from "./indicatorContext";

/** 共通関数定義（ポジションのリスト取得 / オープン / クローズ） */
function generateCommonFunctionDefinitions(): MqlFunction[] {
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

function generateInitFunction(template: StrategyTemplate): MqlFunction {
  const body: MqlStatement[] = [
    ...(template.variables ?? []).map((v) => callStmt("ArraySetAsSeries", [v.name, "true"])),
    ret(ref("INIT_SUCCEEDED")),
  ];

  return fn("OnInit", "int", body);
}

function generateDeinitFunction(template: StrategyTemplate): MqlFunction {
  const body: MqlStatement[] = [
    ...(template.variables ?? []).map((v) => callStmt("ArrayFree", [v.name])),
  ];

  return fn("OnDeinit", "void", body, [arg("reason", "const int")]);
}

/** OnTick 関数の生成 */
function generateTickFunction(template: StrategyTemplate, ctx: IndicatorContext): MqlFunction {
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
        ...template.variables.flatMap((v) => [
          callStmt("ArraySetAsSeries", [v.name, "false"]),
          callStmt("ArrayResize", [v.name, "Bars"]),
          callStmt("ArraySetAsSeries", [v.name, "true"]),
        ]),
      ]),
      loop(
        decl("i", "int", call("MathMin", ["Bars - 1", "diff"])),
        bin(ref("i"), ">=", lit(0)),
        stmt(unary("--", ref("i"))),
        template.variables.map((v) =>
          stmt(bin(ref(`${v.name}[i]`), "=", emitVariableExpression(v.expression, ctx, ref("i"))))
        )
      ),
      stmt(bin(ref("lastBars"), "=", ref("currentBars")))
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
            iff(emitCondition(rule.condition, ctx), [callStmt("CloseOrder", ["tickets[i]"])])
          )
        ),
      ],
      (template.entry || []).map((e) =>
        iff(emitCondition(e.condition, ctx), [
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
export function convertStrategyToMqlAst(
  template: StrategyTemplate,
  indicators: Indicator[]
): MqlFile {
  const vars = (template.variables ?? []).map((v) => globalVar(`${v.name}[]`, "double"));
  vars.push(globalVar("MagicNumber", "int", "123456"));

  const ctx = new IndicatorContext(indicators);
  const initFn = generateInitFunction(template);
  const deinitFn = generateDeinitFunction(template);
  const tickFn = generateTickFunction(template, ctx);
  const { classes, globals, init, deinit } = ctx.generateIndicatorDeclarations();
  initFn.body.splice(0, 0, ...init);
  deinitFn.body.splice(0, 0, ...deinit);

  const functions = [...generateCommonFunctionDefinitions(), initFn, deinitFn, tickFn];

  return file("expert", [...vars, ...globals, ...classes, ...functions], ["show_inputs"], []);
}

function emitVariableExpression(
  expr: VariableExpression,
  ctx: IndicatorContext,
  shift?: MqlExpression
): MqlExpression {
  switch (expr.type) {
    case "constant":
      return lit(expr.value);
    case "price": {
      if (expr.valueType === "array") {
        switch (expr.source) {
          case "open":
            return "Open";
          case "high":
            return "High";
          case "low":
            return "Low";
          case "close":
            return "Close";
          case "tick_volume":
            return "Volume";
          case "volume":
            return "Volume";
        }
      }
      const s =
        typeof expr.shiftBars == "undefined"
          ? shift
            ? shift
            : lit(0)
          : shift
            ? emitVariableExpression(expr.shiftBars, ctx, shift)
            : emitVariableExpression(expr.shiftBars, ctx);
      switch (expr.source) {
        case "ask":
          return `Ask[${s}]`;
        case "bid":
          return `Bid[${s}]`;
        case "open":
          return `Open[${s}]`;
        case "high":
          return `High[${s}]`;
        case "low":
          return `Low[${s}]`;
        case "close":
          return `Close[${s}]`;
        case "median":
          return bin(bin(`High[${s}]`, "+", `Low[${s}]`), "/", 2);
        case "typical":
          return bin(bin(bin(`High[${s}]`, "+", `Low[${s}]`), "+", `Close[${s}]`), "/", 3);
        case "weighted":
          return bin(
            bin(bin(`High[${s}]`, "+", `Low[${s}]`), "+", bin(`Close[${s}]`, "+", `Open[${s}]`)),
            "/",
            4
          );
        case "tick_volume":
        case "volume":
          return `Volume[${s}]`;
      }
      break;
    }
    case "indicator":
      return ctx.getVariableRef(expr);

    case "variable": {
      const varName = expr.name;
      if (expr.valueType === "array") {
        return varName;
      }
      const shiftExpr = expr.shiftBars
        ? shift
          ? bin(shift, "+", emitVariableExpression(expr.shiftBars, ctx))
          : emitVariableExpression(expr.shiftBars, ctx)
        : shift || lit("0");
      return ternary(
        bin("Bars", ">", shiftExpr),
        lit(`${varName}[${shiftExpr}]`),
        expr.fallback ? emitVariableExpression(expr.fallback, ctx) : lit("0")
      );
    }
    case "unary_op":
      return unary(expr.operator, emitVariableExpression(expr.operand, ctx, shift));
    case "binary_op":
      return bin(
        emitVariableExpression(expr.left, ctx, shift),
        expr.operator,
        emitVariableExpression(expr.right, ctx, shift)
      );
    case "ternary":
      return ternary(
        emitCondition(expr.condition, ctx, shift),
        emitVariableExpression(expr.trueExpr, ctx, shift),
        emitVariableExpression(expr.falseExpr, ctx, shift)
      );
    default:
      throw new Error("Unsupported VariableExpression type: " + JSON.stringify(expr));
  }
}

function emitCondition(
  cond: Condition,
  ctx: IndicatorContext,
  shift?: MqlExpression
): MqlExpression {
  switch (cond.type) {
    case "comparison":
      return bin(
        emitOperand(cond.left, ctx, shift ? shift : lit(0)),
        cond.operator,
        emitOperand(cond.right, ctx, shift ? shift : lit(0))
      );
    case "cross": {
      const l_curr = emitOperand(cond.left, ctx, shift ? shift : lit(0));
      const l_prev = emitOperand(cond.left, ctx, shift ? bin(shift, "+", lit(1)) : lit(1));
      const r_curr = emitOperand(cond.right, ctx, shift ? shift : lit(0));
      const r_prev = emitOperand(cond.right, ctx, shift ? bin(shift, "+", lit(1)) : lit(1));
      return cond.direction === "cross_over"
        ? bin(bin(l_prev, "<", r_prev), "&&", bin(l_curr, ">", r_curr))
        : bin(bin(l_prev, ">", r_prev), "&&", bin(l_curr, "<", r_curr));
    }
    case "state": {
      const conds = [];
      const sign = cond.state === "rising" ? ">" : "<";
      for (let i = 0; i < Math.abs(cond.consecutiveBars || 1); i++) {
        const var_curr = emitOperand(cond.operand, ctx, shift ? bin(shift, "+", lit(i)) : lit(i));
        const var_prev = emitOperand(
          cond.operand,
          ctx,
          shift ? bin(shift, "+", lit(i + 1)) : lit(i + 1)
        );
        conds.push(`${var_curr} ${sign} ${var_prev}`);
      }
      return conds.join(" and ");
    }
    case "continue": {
      const conds = [];
      for (let i = 0; i < Math.abs(cond.consecutiveBars || 2); i++) {
        const condition = emitCondition(
          cond.condition,
          ctx,
          shift ? bin(shift, "+", lit(i)) : lit(i)
        );
        conds.push(condition);
      }
      return `${cond.continue === "true" ? "" : "!"}(${conds.join(" && ")})`;
    }
    case "change": {
      const inner_curr = emitCondition(cond.condition, ctx, shift);
      const inner_prev = emitCondition(cond.condition, ctx, shift);
      return cond.change === "to_true"
        ? `!(${inner_prev}) && (${inner_curr})`
        : `(${inner_prev}) && !(${inner_curr})`;
    }
    case "group":
      return (
        "(" +
        cond.conditions
          .map((c) => emitCondition(c, ctx, shift))
          .join(`) ${cond.operator === "and" ? "&&" : "||"} (`) +
        ")"
      );
    default:
      return "false";
  }
}

function emitOperand(
  op: ConditionOperand,
  ctx: IndicatorContext,
  shift?: MqlExpression
): MqlExpression {
  switch (op.type) {
    case "constant":
      return lit(op.value);
    case "source":
    case "variable": {
      const varName = op.name;
      if (op.valueType == "array") {
        if (!shift || shift.toString() === "0") {
          return lit(`${varName}[0]`);
        } else {
          return ternary(bin("Bars", ">", shift), `${varName}[${shift}]`, 0);
        }
      } else {
        const shiftBars = op.shiftBars
          ? emitVariableExpression(op.shiftBars, ctx, shift)
          : shift?.toString() || "0";
        if (shiftBars.toString() === "0") {
          return lit(`${varName}[0]`);
        } else {
          return ternary(bin("Bars", ">", shiftBars), `${varName}[${shiftBars}]`, 0);
        }
      }
    }
  }
}
