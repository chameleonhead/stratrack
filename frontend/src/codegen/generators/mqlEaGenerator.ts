import { MqlExpression, MqlFile, MqlFunction, MqlStatement } from "../ast/mql/mqlast";
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
} from "../ast/mql/mqlhelper";
import { BarExpression, CommonCondition, ScalarExpression } from "../dsl/common";
import { Indicator } from "../dsl/indicator";
import { StrategyTemplate } from "../dsl/strategy";
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
          stmt(
            bin(ref(`${v.name}[i]`), "=", emitScalarVariableExpression(v.expression, ctx, ref("i")))
          )
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

function emitArrayVariableExpression(expr: BarExpression): MqlExpression {
  switch (expr.type) {
    case "price": {
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
      break;
    }
    case "variable": {
      return expr.name;
    }
  }
  throw new Error("Unsupported VariableExpression type: " + JSON.stringify(expr));
}

function toFixed(value: number) {
  const e = parseInt(value.toString().split("e-")[1]);
  if (isNaN(e)) {
    return value.toString();
  }
  return value.toFixed(e);
}

function barAccess(
  varName: MqlExpression,
  shift: MqlExpression,
  fallback?: MqlExpression
): MqlExpression {
  if (shift.toString() === "0") {
    return `${varName}[0]`;
  }
  return ternary(bin("Bars", ">", shift), `${varName}[${shift}]`, fallback ?? lit("0"));
}

function emitScalarVariableExpression(
  expr: ScalarExpression,
  ctx: IndicatorContext,
  shift?: MqlExpression
): MqlExpression {
  switch (expr.type) {
    case "constant":
      return lit(toFixed(expr.value));
    case "param":
      return ref(expr.name);
    case "scalar_price": {
      const s =
        typeof expr.shiftBars == "undefined"
          ? shift
            ? shift
            : lit(0)
          : shift
            ? emitScalarVariableExpression(expr.shiftBars, ctx, shift)
            : emitScalarVariableExpression(expr.shiftBars, ctx);
      switch (expr.source) {
        case "ask":
          return barAccess("Ask", s);
        case "bid":
          return barAccess("Bid", s);
        case "open":
          return barAccess("Open", s);
        case "high":
          return barAccess("High", s);
        case "low":
          return barAccess("Low", s);
        case "close":
          return barAccess("Close", s);
        case "median":
          return bin(bin(barAccess("High", s), "+", barAccess("Low", s)), "/", 2);
        case "typical":
          return bin(
            bin(bin(barAccess("High", s), "+", barAccess("Low", s)), "+", barAccess("Close", s)),
            "/",
            3
          );
        case "weighted":
          return bin(
            bin(
              bin(barAccess("High", s), "+", barAccess("Low", s)),
              "+",
              bin(barAccess("Close", s), "+", barAccess("Open", s))
            ),
            "/",
            4
          );
        case "tick_volume":
        case "volume":
          return barAccess("Volume", s);
      }
      break;
    }
    case "indicator":
      return ctx.getVariableExpression(expr, emitArrayVariableExpression);

    case "bar_value": {
      const varName = emitArrayVariableExpression(expr.source);
      const shiftExpr = expr.shiftBars
        ? shift
          ? bin(shift, "+", emitScalarVariableExpression(expr.shiftBars, ctx))
          : emitScalarVariableExpression(expr.shiftBars, ctx)
        : shift || lit("0");
      return barAccess(
        varName,
        shiftExpr,
        expr.fallback
          ? emitScalarVariableExpression(expr.fallback as ScalarExpression, ctx)
          : lit("0")
      );
    }
    case "unary_op":
      return unary(expr.operator, emitScalarVariableExpression(expr.operand, ctx, shift));
    case "binary_op":
      return bin(
        emitScalarVariableExpression(expr.left, ctx, shift),
        expr.operator,
        emitScalarVariableExpression(expr.right, ctx, shift)
      );
    case "ternary":
      return ternary(
        emitCondition(expr.condition, ctx, shift),
        emitScalarVariableExpression(expr.trueExpr, ctx, shift),
        emitScalarVariableExpression(expr.falseExpr, ctx, shift)
      );
  }
  throw new Error("Unsupported VariableExpression type: " + JSON.stringify(expr));
}

function isBar(expr: BarExpression | ScalarExpression): boolean {
  return (expr as BarExpression).valueType === "bar";
}

function emitCondition(
  cond: CommonCondition,
  ctx: IndicatorContext,
  shift?: MqlExpression
): MqlExpression {
  switch (cond.type) {
    case "comparison":
      return bin(
        emitScalarVariableExpression(cond.left, ctx, shift ? shift : lit(0)),
        cond.operator,
        emitScalarVariableExpression(cond.right, ctx, shift ? shift : lit(0))
      );
    case "cross": {
      const curr = shift && `${shift}` !== "0" ? shift : lit(0);
      const prev = typeof shift !== "undefined" ? bin(shift, "+", lit(1)) : lit(1);
      const l_curr = isBar(cond.left)
        ? barAccess(emitArrayVariableExpression(cond.left as BarExpression), curr)
        : emitScalarVariableExpression(cond.left as ScalarExpression, ctx, curr);
      const l_prev = isBar(cond.left)
        ? barAccess(emitArrayVariableExpression(cond.left as BarExpression), prev)
        : emitScalarVariableExpression(cond.left as ScalarExpression, ctx, prev);
      const r_curr = isBar(cond.right)
        ? barAccess(emitArrayVariableExpression(cond.right as BarExpression), curr)
        : emitScalarVariableExpression(cond.right as ScalarExpression, ctx, curr);
      const r_prev = isBar(cond.right)
        ? barAccess(emitArrayVariableExpression(cond.right as BarExpression), prev)
        : emitScalarVariableExpression(cond.right as ScalarExpression, ctx, prev);

      return cond.direction === "cross_over"
        ? bin(bin(l_prev, "<", r_prev), "&&", bin(l_curr, ">", r_curr))
        : bin(bin(l_prev, ">", r_prev), "&&", bin(l_curr, "<", r_curr));
    }
    case "state": {
      const conds = [];
      const sign = cond.state === "rising" ? ">" : "<";
      const varName = emitArrayVariableExpression(cond.operand);
      for (let i = 0; i < Math.abs(cond.consecutiveBars || 1); i++) {
        conds.push(
          bin(
            barAccess(varName, shift ? bin(shift, "+", lit(i)) : lit(i)),
            sign,
            barAccess(varName, shift ? bin(shift, "+", lit(i + 1)) : lit(i + 1))
          )
        );
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
