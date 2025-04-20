import { IRIndicatorInstance, IRProgram, IRStrategy } from "../../ir/ast";
import { MqlExpr, MqlFunction, MqlProgram, MqlStatement } from "../ast";
import {
  access,
  arg,
  assignStmt,
  binary,
  call,
  callStmt,
  decl,
  declStmt,
  ea,
  fn,
  iff,
  lit,
  loop,
  ref,
  ret,
  stmt,
  strlit,
  ternary,
  unary,
} from "../helper";
import { emitMqlCondFromIR, emitMqlExprFromIR } from "./emitExpr";
import { emitMqlIndicatorFromIR } from "./emitIndicator";

const ZERO = lit(0);
const ONE = lit(1);
const TRUE = lit("true");
const FALSE = lit("false");

/** 共通関数定義（ポジションのリスト取得 / オープン / クローズ） */
function generateCommonFunctionDefinitions(): MqlFunction[] {
  const tikcetCountRef = ref("ticketsCount");
  const ticketsRef = ref("tickets");
  const magicNumberRef = ref("MagicNumber");
  const iRef = ref("i");
  const orderTotalFunc = () => call("OrdersTotal", []);
  const orderSelectFunc = (i: MqlExpr) =>
    call("OrderSelect", [i, ref("SELECT_BY_POS"), ref("MODE_TRADES")]);
  const orderTicketFunc = () => call("OrderTicket", []);
  return [
    fn(
      "ListOpenPosition",
      "void",
      [arg("symbol", "string"), arg("tickets[]", "int&")],
      [
        declStmt(tikcetCountRef.name, "int", ZERO),
        callStmt("ArrayResize", [ticketsRef, tikcetCountRef]),
        loop(
          declStmt("i", "int", binary("-", orderTotalFunc(), ONE)),
          binary(">=", iRef, ZERO),
          stmt(unary("--", ref("i"))),
          [
            iff(
              binary(
                "&&",
                binary(
                  "&&",
                  orderSelectFunc(iRef),
                  binary("==", call("OrderSymbol", []), ref("symbol"))
                ),
                binary("==", call("OrderMagicNumber", []), magicNumberRef)
              ),
              [
                callStmt("ArrayResize", [ticketsRef, unary("++", tikcetCountRef)]),
                stmt(
                  binary(
                    "=",
                    access(ticketsRef, binary("-", tikcetCountRef, ONE)),
                    orderTicketFunc()
                  )
                ),
              ]
            ),
          ]
        ),
      ]
    ),

    fn(
      "OpenOrder",
      "void",
      [arg("type", "string"), arg("lots", "double"), arg("price", "double")],
      [
        declStmt(
          "cmd",
          "int",
          ternary(binary("==", ref("type"), strlit("buy")), lit("OP_BUY"), lit("OP_SELL"))
        ),
        callStmt("OrderSend", [
          lit("Symbol()"),
          ref("cmd"),
          ref("lots"),
          ref("price"),
          lit(3),
          ZERO,
          ZERO,
          strlit(""),
          magicNumberRef,
          ZERO,
          lit("clrGreen"),
        ]),
      ]
    ),

    fn(
      "CloseOrder",
      "void",
      [arg("ticket", "int")],
      [
        iff(call("OrderSelect", [ref("ticket"), ref("SELECT_BY_TICKET")]), [
          declStmt(
            "price",
            "double",
            ternary(binary("==", call("OrderType", []), ref("OP_BUY")), ref("Bid"), ref("Ask"))
          ),
          callStmt("OrderClose", [
            ref("ticket"),
            lit("OrderLots()"),
            ref("price"),
            lit(3),
            lit("clrRed"),
          ]),
        ]),
      ]
    ),
  ];
}

function generateInitFunction(strategy: IRStrategy, instances: IRIndicatorInstance[]): MqlFunction {
  const body: MqlStatement[] = [
    ...(strategy.variables ?? []).map((v) => callStmt("ArraySetAsSeries", [ref(v.name), TRUE])),
    ...(instances ?? []).map((i) =>
      assignStmt(
        ref(i.id),
        call(
          `new ${i.pascalName}`,
          i.params
            .filter((p) => p.type === "constant" || p.type === "aggregation_type_value")
            .map((p) => emitMqlExprFromIR("strategy", p))
        )
      )
    ),
    ret(ref("INIT_SUCCEEDED")),
  ];

  return fn("OnInit", "int", [], body);
}

function generateDeinitFunction(
  strategy: IRStrategy,
  instances: IRIndicatorInstance[]
): MqlFunction {
  const body: MqlStatement[] = [
    ...(strategy.variables ?? []).map((v) => callStmt("ArrayFree", [ref(v.name)])),
    ...(instances ?? []).map((i) => callStmt("delete", [ref(i.id)])),
  ];

  return fn("OnDeinit", "void", [arg("reason", "const int")], body);
}

/** OnTick 関数の生成 */
function generateTickFunction(strategy: IRStrategy): MqlFunction {
  const barsRef = ref("Bars");
  const lastBarsRef = ref("lastBars");
  const currentBarsRef = ref("currentBars");
  const diffRef = ref("diff");

  const stmts: MqlStatement[] = [
    // Bars < 100 チェック
    iff(binary("<", barsRef, lit(100)), [ret()]),
  ];

  // 変数初期化（配列リサイズ・差分埋め）
  if (strategy.variables?.length) {
    stmts.push(
      declStmt(lastBarsRef.name, "static int", ZERO),
      declStmt(currentBarsRef.name, "int", barsRef),
      declStmt(diffRef.name, "int", binary("-", currentBarsRef, lastBarsRef)),
      iff(binary(">", ref("diff"), ZERO), [
        ...strategy.variables.flatMap((v) => [
          callStmt("ArraySetAsSeries", [ref(v.name), FALSE]),
          callStmt("ArrayResize", [ref(v.name), barsRef]),
          callStmt("ArraySetAsSeries", [ref(v.name), TRUE]),
        ]),
      ]),
      loop(
        declStmt("i", "int", call("MathMin", [binary("-", barsRef, ONE), diffRef])),
        binary(">=", ref("i"), ZERO),
        stmt(unary("--", ref("i"))),
        strategy.variables.map((v) => {
          if (v.invalidPeriod) {
            return assignStmt(
              access(ref(v.name), ref("i")),
              ternary(
                binary(">", barsRef, emitMqlExprFromIR("strategy", v.invalidPeriod, ref("i"))),
                emitMqlExprFromIR("strategy", v.expression, ref("i")),
                v.fallback ? emitMqlExprFromIR("strategy", v.fallback, ref("i")) : lit(0)
              )
            );
          }
          return assignStmt(
            access(ref(v.name), ref("i")),
            emitMqlExprFromIR("strategy", v.expression, ref("i"))
          );
        })
      ),
      stmt(binary("=", lastBarsRef, currentBarsRef))
    );
  }

  const ticketsRef = ref("tickets");

  // ポジションチェックとエントリー・イグジット処理
  stmts.push(
    declStmt(`${ticketsRef.name}[]`, "int"),
    callStmt("ListOpenPosition", [lit("Symbol()"), ticketsRef]),
    iff(
      binary(">", call("ArraySize", [ticketsRef]), ZERO),
      [
        loop(
          declStmt("i", "int", ZERO),
          binary("<", ref("i"), call("ArraySize", [ticketsRef])),
          stmt(unary("++", ref("i"))),
          (strategy.exitConditions || []).map((e) =>
            iff(emitMqlCondFromIR("strategy", e.condition), [
              callStmt("CloseOrder", [access(ticketsRef, ref("i"))]),
            ])
          )
        ),
      ],
      (strategy.entryConditions || []).map((e) =>
        iff(emitMqlCondFromIR("strategy", e.condition), [
          callStmt("OpenOrder", [
            e.type === "long" ? strlit("buy") : strlit("sell"),
            lit(0.1),
            e.type === "long" ? lit("Ask") : lit("Bid"),
          ]),
        ])
      )
    ),
    callStmt("ArrayFree", [ticketsRef])
  );

  return fn("OnTick", "void", [], stmts);
}

/**
 * StrategyTemplate から MQL4 AST ファイルを生成
 */
export function emitMqlEaFromIR(program: IRProgram): MqlProgram {
  const strategy = program.strategy;
  const indicatorClasses = program.indicatorDefs.map((i) => emitMqlIndicatorFromIR(i));

  const vars = (strategy.variables ?? []).map((v) => decl(`${v.name}[]`, "double"));
  vars.push(decl("MagicNumber", "int", lit("123456")));
  vars.push(...program.indicatorInstances.map((i) => decl(i.id, `${i.pascalName}*`)));

  const initFn = generateInitFunction(strategy, program.indicatorInstances);
  const deinitFn = generateDeinitFunction(strategy, program.indicatorInstances);
  const tickFn = generateTickFunction(strategy);

  const functions = [...generateCommonFunctionDefinitions(), initFn, deinitFn, tickFn];

  return ea(indicatorClasses, ["show_inputs"], vars, functions);
}
