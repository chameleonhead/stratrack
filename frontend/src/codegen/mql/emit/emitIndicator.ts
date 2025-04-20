import { AggregationType } from "../../dsl/common";
import { IRIndicatorDefinition } from "../../ir/ast";
import {
  MqlClass,
  MqlClassField,
  MqlClassMethod,
  MqlConstructor,
  MqlDestructor,
  MqlStatement,
} from "../ast";
import {
  access,
  arg,
  assignStmt,
  binary,
  call,
  callStmt,
  classDecl,
  ctor,
  declStmt,
  dtor,
  field,
  iff,
  lit,
  loop,
  member,
  method,
  or,
  ref,
  ret,
  stmt,
  strlit as strlit,
  ternary,
  unary,
} from "../helper";
import { aggregationMethodMapForClass } from "./emitAggregation";
import { emitMqlExprFromIR } from "./emitExpr";

const DEBUG = false;

export function emitMqlIndicatorFromIR(indicator: IRIndicatorDefinition): MqlClass {
  const fields: MqlClassField[] = [];
  const methods: (MqlClassMethod | MqlConstructor | MqlDestructor)[] = [];
  const params = indicator.params;
  const variables = indicator.variables;
  const exports = indicator.exportVars;
  const aggregationTypes: AggregationType[] = indicator.usedAggregations;
  // --- フィールド定義 ---
  variables.forEach((v) => {
    fields.push(field(`${v.name}[]`, "double", "private"));
  });
  fields.push(field("lastCalculated", "int", "private"));
  fields.push(field("lastBars", "int", "private"));

  // --- パラメータをフィールドとして持つ（自動） ---
  for (const p of params) {
    if (!fields.find((f) => f.name === p.name)) {
      switch (p.type) {
        case "number":
          fields.push(field(p.name, "int", "private"));
          break;
        case "aggregationType":
          fields.push(field(p.name, "string", "private"));
          break;
      }
    }
  }

  // 集計関数を生成
  methods.push(...aggregationTypes.map((m) => aggregationMethodMapForClass[m]));

  // --- コンストラクタ生成 ---
  const constructorArgs = params
    .filter((p) => p.type === "number" || p.type === "aggregationType")
    .map((p) => {
      switch (p.type) {
        case "number":
          return arg(p.name, "int");
        case "aggregationType":
          return arg(p.name, "string");
      }
    });

  const thisRef = ref("this");
  const lastCalculatedRef = member(thisRef, "lastCalculated");
  const lastBarsRef = member(thisRef, "lastBars");
  const barsRef = ref("Bars");
  const constructorBody: MqlStatement[] = [
    assignStmt(lastCalculatedRef, lit(-1)),
    assignStmt(lastBarsRef, lit(0)),
    ...params
      .filter((p) => p.type === "number" || p.type === "aggregationType")
      .map((p) => {
        switch (p.type) {
          case "number":
          case "aggregationType":
            return assignStmt(member(thisRef, p.name), ref(p.name));
        }
      }),
    ...variables.map((v) => callStmt("ArraySetAsSeries", [member(thisRef, v.name), lit("true")])),
  ];
  methods.push(ctor(constructorBody, constructorArgs));

  // --- Update メソッド（変数式の評価） ---
  const updateBody: MqlStatement[] = [];

  // メイン計算ループ
  updateBody.push(
    iff(binary(">", barsRef, lastBarsRef), [
      ...variables.flatMap((v) => [
        callStmt("ArraySetAsSeries", [ref(`this.${v.name}`), lit("false")]),
        callStmt("ArrayResize", [ref(`this.${v.name}`), barsRef]),
        callStmt("ArraySetAsSeries", [ref(`this.${v.name}`), lit("true")]),
      ]),
      stmt(binary("=", lastBarsRef, barsRef)),
      iff(binary("!=", lastCalculatedRef, lit(-1)), [stmt(lit("this.lastCalculated++"))]),
    ]),
    declStmt(
      "start",
      "int",
      ternary(
        binary("==", lastCalculatedRef, lit(-1)),
        binary("-", barsRef, lit(1)),
        lastCalculatedRef
      )
    ),
    declStmt("end", "int", ref("i")),
    ...(DEBUG
      ? [
        callStmt("Print", [strlit("Start: "), ref("start"), strlit(", end: "), ref("end")]),
        ...variables.map((v) =>
          callStmt("Print", [
            strlit(`Before update ${v.name}: `),
            access(member(ref("this"), v.name), ref("i")),
            strlit(", "),
            access(member(ref("this"), v.name), binary("+", ref("i"), lit(1)), false),
            strlit(", "),
            access(member(ref("this"), v.name), binary("+", ref("i"), lit(2)), false),
          ])
        ),
      ]
      : []),
    loop(
      declStmt("j", "int", ref("start")),
      binary(">=", ref("j"), ref("end")),
      stmt(unary("--", ref("j"))),
      // 計算本体（sum / period）
      variables.flatMap((v) => {
        return assignStmt(
          access(member(thisRef, v.name), ref("j")),
          emitMqlExprFromIR("indicator", v.expression, ref("j"))
        );
      })
    ),
    ...(DEBUG
      ? variables.map((v) =>
        callStmt("Print", [
          strlit(`After update ${v.name}: `),
          access(member(ref("this"), v.name), ref("i")),
          strlit(", "),
          access(member(ref("this"), v.name), binary("+", ref("i"), lit(1)), false),
          strlit(", "),
          access(member(ref("this"), v.name), binary("+", ref("i"), lit(2)), false),
        ])
      )
      : []),
    // 最後に lastCalculated を更新
    stmt(
      binary(
        "=",
        lastCalculatedRef,
        call("MathMin", [binary("-", barsRef, lit("1")), lit("end + 1")])
      )
    )
  );

  methods.push(
    method("Update", "void", updateBody, [
      arg("i", "int"),
      ...params.filter((p) => p.type === "source").map((p) => arg(`&${p.name}[]`, "double")),
    ])
  );

  // --- Get メソッド ---
  methods.push(
    method(
      "Get",
      "double",
      [
        iff(
          or(binary("==", lastCalculatedRef, lit(-1)), binary("<=", ref("i"), lastCalculatedRef)),
          [
            callStmt("this.Update", [
              ref("i"),
              ...params.filter((p) => p.type === "source").map((p) => ref(p.name)),
            ]),
          ]
        ),
        ...exports.flatMap((e) => {
          return [
            iff(binary("==", ref("lineName"), strlit(e)), [
              ret(access(member(thisRef, e), ref("i"))),
            ]),
          ];
        }),
        ret(lit(-1)),
      ],
      [
        arg("lineName", "string"),
        arg("i", "int"),
        ...params.filter((p) => p.type === "source").map((p) => arg(`&${p.name}[]`, "double")),
      ]
    )
  );

  // --- デストラクタ ---
  methods.push(
    dtor(
      variables.map((v) => {
        return callStmt("ArrayFree", [ref(`this.${v.name}`)]);
      })
    )
  );

  return classDecl(
    indicator.pascalName,
    fields,
    methods.filter((m) => m.type === "method"),
    methods.find((m) => m.type === "constructor"),
    methods.find((m) => m.type === "destructor")
  );
}
