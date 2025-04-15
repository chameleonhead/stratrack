import { MqlExpression, MqlFile, MqlFunction, MqlStatement } from "../../codegen/mql/mqlast";
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
import { Indicator } from "../../indicators/types";
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
        decl("i", "int", bin(ref("diff"), "-", lit(1))),
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
  expr: VariableExpression | IndicatorExpression,
  ctx: IndicatorContext,
  shift?: MqlExpression
): MqlExpression {
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
        return [lit(`${varName}[${shift ? shift : 0}]`)];
      }
      return [lit(`${varName}[${expr.shiftBars}]`)];
    }
    case "indicator": {
      return ctx.getVariableRef(expr);
    }
    case "variable":
      return [lit(`${expr.name}[${shift ? shift : 0}]`)];
    case "unary_op":
      return [unary(expr.operator, emitVariableExpression(expr.operand, ctx, shift))];
    case "binary_op":
      return [
        bin(
          emitVariableExpression(expr.left, ctx, shift),
          expr.operator,
          emitVariableExpression(expr.right, ctx, shift)
        ),
      ];
    case "ternary":
      return [
        ternary(
          emitCondition(expr.condition, shift),
          emitVariableExpression(expr.trueExpr, ctx, shift),
          emitVariableExpression(expr.falseExpr, ctx, shift)
        ),
      ];
  }
  return [comment("Unsupported variable type")];
}

function emitCondition(cond: Condition, shift?: MqlExpression): MqlExpression {
  switch (cond.type) {
    case "comparison":
      return `(${emitOperand(cond.left, shift ? shift : lit(0))} ${cond.operator} ${emitOperand(cond.right, shift ? shift : lit(0))})`;
    case "cross": {
      const l_curr = emitOperand(cond.left, shift ? shift : lit(0));
      const l_prev = emitOperand(cond.left, shift ? bin(shift, "+", lit(1)) : lit(1));
      const r_curr = emitOperand(cond.right, shift ? shift : lit(0));
      const r_prev = emitOperand(cond.right, shift ? bin(shift, "+", lit(1)) : lit(1));
      return cond.direction === "cross_over"
        ? `(${l_prev} < ${r_prev} && ${l_curr} > ${r_curr})`
        : `(${l_prev} > ${r_prev} && ${l_curr} < ${r_curr})`;
    }
    case "state": {
      const conds = [];
      const sign = cond.state === "rising" ? ">" : "<";
      for (let i = 0; i < Math.abs(cond.length || 1); i++) {
        const var_curr = emitOperand(cond.operand, shift ? bin(shift, "+", lit(i)) : lit(i));
        const var_prev = emitOperand(
          cond.operand,
          shift ? bin(shift, "+", lit(i + 1)) : lit(i + 1)
        );
        conds.push(`${var_curr} ${sign} ${var_prev}`);
      }
      return conds.join(" and ");
    }
    case "continue": {
      const conds = [];
      for (let i = 0; i < Math.abs(cond.length || 2); i++) {
        const condition = emitCondition(cond.condition, shift ? bin(shift, "+", lit(i)) : lit(i));
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

function emitOperand(op: ConditionOperand, shift?: MqlExpression): string {
  return op.type === "variable" ? `${op.name}[${shift || 0}]` : `${op.value}`;
}
