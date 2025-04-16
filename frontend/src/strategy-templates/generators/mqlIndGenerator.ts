import {
  MqlClass,
  MqlClassField,
  MqlClassMethod,
  MqlConstructor,
  MqlDestructor,
  MqlExpression,
  MqlStatement,
  MqlVariableRef,
} from "../../codegen/mql/mqlast";
import {
  arg,
  bin,
  call,
  callStmt,
  decl,
  dtor,
  field,
  iff,
  lit,
  loop,
  method,
  ref,
  ret,
  stmt,
  ternary,
  unary,
} from "../../codegen/mql/mqlhelper";
import {
  AggregationExpression,
  AggregationType,
  AggregationTypeExpression,
  AggregationTypeIndicatorParam,
  Indicator,
  IndicatorExpression,
  VariableExpression,
} from "../../indicators/types";
import { IndicatorContext } from "./indicatorContext";

const DEBUG = false;
const aggregationMethodMapForClass: Record<AggregationType, MqlClassMethod> = {
  sma: method(
    "sma",
    "double",
    [
      decl("sum", "double", lit("0")),
      loop(decl("j", "int", lit("0")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        stmt(bin(ref("sum"), "+=", ref("src[i + j]"))),
      ]),
      ret(bin(ref("sum"), "/", ref("p"))),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  ema: method(
    "ema",
    "double",
    [
      decl("alpha", "double", "2.0 / (p + 1)"),
      decl("emaValue", "double", "src[i + p - 1]"),
      loop(
        decl("j", "int", lit("p - 2")),
        bin(ref("j"), ">=", lit("0")),
        stmt(unary("--", ref("j"))),
        [
          stmt(
            bin(
              ref("emaValue"),
              "=",
              bin(
                bin(lit("alpha"), "*", ref("src[i + j]")),
                "+",
                bin(lit("(1 - alpha)"), "*", ref("emaValue"))
              )
            )
          ),
        ]
      ),
      ret(ref("emaValue")),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  rma: method(
    "rma",
    "double",
    [
      decl("value", "double", "src[i + p - 1]"),
      loop(
        decl("j", "int", lit("p - 2")),
        bin(ref("j"), ">=", lit("0")),
        stmt(unary("--", ref("j"))),
        [
          stmt(
            bin(
              ref("value"),
              "=",
              bin(bin(ref("value"), "*", lit("(p - 1)")), "+", ref("src[i + j]"))
            )
          ),
          stmt(bin(ref("value"), "=", bin(ref("value"), "/", ref("p")))),
        ]
      ),
      ret(ref("value")),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  lwma: method(
    "lwma",
    "double",
    [
      decl("weightedSum", "double", "0"),
      decl("totalWeight", "double", "0"),
      loop(decl("j", "int", lit("0")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        decl("weight", "int", bin(ref("p"), "-", ref("j"))),
        stmt(bin(ref("weightedSum"), "+=", bin(ref("src[i + j]"), "*", ref("weight")))),
        stmt(bin(ref("totalWeight"), "+=", ref("weight"))),
      ]),
      ret(bin(ref("weightedSum"), "/", ref("totalWeight"))),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  smma: method(
    "smma",
    "double",
    [
      decl("value", "double", "src[i + p - 1]"),
      loop(
        decl("j", "int", lit("p - 2")),
        bin(ref("j"), ">=", lit("0")),
        stmt(unary("--", ref("j"))),
        [
          stmt(
            bin(
              ref("value"),
              "=",
              bin(bin(ref("value"), "*", lit("(p - 1)")), "+", ref("src[i + j]"))
            )
          ),
          stmt(bin(ref("value"), "=", bin(ref("value"), "/", ref("p")))),
        ]
      ),
      ret(ref("value")),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  sum: method(
    "sum",
    "double",
    [
      decl("total", "double", lit("0")),
      loop(decl("j", "int", lit("0")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        stmt(bin(ref("total"), "+=", ref("src[i + j]"))),
      ]),
      ret(ref("total")),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  std: method(
    "std",
    "double",
    [
      decl("sum", "double", "0"),
      decl("sumSq", "double", "0"),
      loop(decl("j", "int", lit("0")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        decl("v", "double", ref("src[i + j]")),
        stmt(bin(ref("sum"), "+=", ref("v"))),
        stmt(bin(ref("sumSq"), "+=", bin(ref("v"), "*", ref("v")))),
      ]),
      decl("mean", "double", bin(ref("sum"), "/", ref("p"))),
      ret(
        call("MathSqrt", [
          bin(bin(ref("sumSq"), "/", ref("p")), "-", bin(ref("mean"), "*", ref("mean"))),
        ])
      ),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  max: method(
    "max",
    "double",
    [
      stmt(lit("double m = src[i];")),
      loop(decl("j", "int", lit("1")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        iff(bin(ref("src[i + j]"), ">", ref("m")), [stmt(bin(ref("m"), "=", ref("src[i + j]")))]),
      ]),
      ret(ref("m")),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),
  min: method(
    "min",
    "double",
    [
      stmt(lit("double m = src[i];")),
      loop(decl("j", "int", lit("1")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        iff(bin(ref("src[i + j]"), "<", ref("m")), [stmt(bin(ref("m"), "=", ref("src[i + j]")))]),
      ]),
      ret(ref("m")),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  median: method(
    "median",
    "double",
    [
      // バッファ確保
      decl("tmp[]", "double"),
      callStmt("ArrayResize", [ref("tmp"), ref("p")]),

      // コピー
      loop(decl("j", "int", lit("0")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        stmt(bin(ref("tmp[j]"), "=", ref("src[i + j]"))),
      ]),

      // ソート
      callStmt("ArraySort", [ref("tmp")]),

      // 奇数/偶数チェック
      iff(
        bin(bin(ref("p"), "%", lit("2")), "==", lit("0")),
        [ret(bin(bin(ref("tmp[p / 2 - 1]"), "+", ref("tmp[p / 2]")), "/", lit("2.0")))],
        [ret(ref("tmp[p / 2]"))]
      ),
      callStmt("ArrayFree", [ref("tmp")]),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  mean_absolute_deviation: method(
    "mean_absolute_deviation",
    "double",
    [
      // 合計を求めて平均を出す
      decl("sum", "double", "0"),
      loop(decl("j", "int", lit("0")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        stmt(bin(ref("sum"), "+=", ref("src[i + j]"))),
      ]),
      decl("mean", "double", bin(ref("sum"), "/", ref("p"))),

      // 平均との絶対偏差
      stmt(lit("double mad = 0;")),
      loop(decl("j", "int", lit("0")), bin(ref("j"), "<", ref("p")), stmt(unary("++", ref("j"))), [
        stmt(bin(ref("mad"), "+=", call("MathAbs", [bin(ref("src[i + j]"), "-", ref("mean"))]))),
      ]),

      ret(bin(ref("mad"), "/", ref("p"))),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),
};

export function generateClassFromIndicator(
  name: string,
  indicator: Indicator,
  ctx: IndicatorContext
): MqlClass {
  const fields: MqlClassField[] = [];
  const methods: (MqlClassMethod | MqlConstructor | MqlDestructor)[] = [];
  const template = indicator.template!;
  const params = indicator.params;
  const variables = template.variables;
  const exports = template.exports;
  const aggregationTypes: AggregationType[] = variables
    .filter(
      (v) => v.expression.type === "aggregation" && v.expression.method.type === "aggregationType"
    )
    .map((v) => ((v.expression as AggregationExpression).method as AggregationTypeExpression).value)
    .concat(
      variables
        .filter(
          (v) =>
            v.fallback &&
            v.fallback.expression.type === "aggregation" &&
            v.fallback.expression.method.type === "aggregationType"
        )
        .map(
          (v) =>
            ((v.fallback!.expression as AggregationExpression).method as AggregationTypeExpression)
              .value
        )
    )
    .concat(params.filter((p) => p.type == "aggregationType").flatMap((p) => p.selectableTypes))
    .filter((value, index, array) => array.indexOf(value) === index);
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
  const constructorBody: MqlStatement[] = [
    stmt(bin("this.lastCalculated", "=", -1)),
    stmt(bin("this.lastBars", "=", 0)),
    ...params
      .filter((p) => p.type === "number" || p.type === "aggregationType")
      .map((p) => {
        switch (p.type) {
          case "number":
          case "aggregationType":
            return stmt(bin(ref(`this.${p.name}`), "=", ref(p.name)));
        }
      }),
    ...variables.map((v) => callStmt("ArraySetAsSeries", [ref(`this.${v.name}`), lit("true")])),
  ];
  methods.push(new MqlConstructor(name, constructorBody, constructorArgs));

  // --- Update メソッド（変数式の評価） ---
  const updateBody: MqlStatement[] = [];

  // メイン計算ループ
  updateBody.push(
    iff(bin("Bars", ">", "this.lastBars"), [
      ...variables.flatMap((v) => [
        callStmt("ArraySetAsSeries", [ref(`this.${v.name}`), lit("false")]),
        callStmt("ArrayResize", [ref(`this.${v.name}`), lit("Bars")]),
        callStmt("ArraySetAsSeries", [ref(`this.${v.name}`), lit("true")]),
      ]),
      stmt(bin("this.lastBars", "=", "Bars")),
      stmt(lit("this.lastCalculated++")),
    ]),
    decl(
      "start",
      "int",
      ternary(bin("this.lastCalculated", "==", -1), bin("Bars", "-", 1), lit("this.lastCalculated"))
    ),
    decl("end", "int", ref("i")),
    ...(DEBUG
      ? [
          callStmt("Print", ['"Start: "', "start", '", end: "', "end"]),
          ...variables.map((v) =>
            callStmt("Print", [
              `"Before update ${v.name}: "`,
              `${v.name}[i]`,
              '", "',
              ternary("i + 1 < Bars - 1", `${v.name}[i + 1]`, 0),
              '", "',
              ternary("i + 2 < Bars - 1", `${v.name}[i + 2]`, 0),
            ])
          ),
        ]
      : []),
    loop(
      decl("j", "int", ref("start")),
      bin(ref("j"), ">=", ref("end")),
      stmt(unary("--", ref("j"))),
      // 計算本体（sum / period）
      variables.flatMap((v) => {
        if (v.invalidPeriod) {
          return [
            iff(
              bin("Bars", ">", bin("j", "+", convertVariableExpression(v.invalidPeriod, ctx))),
              convertVariableDefinition(v.name, v.expression, ctx, indicator, ref("j")),
              [
                ...(v.fallback?.invalidPeriod
                  ? [
                      iff(
                        bin(
                          "Bars",
                          ">",
                          bin("j", "+", convertVariableExpression(v.fallback.invalidPeriod, ctx))
                        ),
                        convertVariableDefinition(
                          v.name,
                          v.fallback.expression,
                          ctx,
                          indicator,
                          ref("j")
                        ),
                        [
                          stmt(
                            bin(
                              ref(`this.${v.name}[j]`),
                              "=",
                              v.fallback.fallback
                                ? convertVariableExpression(v.fallback.fallback, ctx)
                                : lit("0")
                            )
                          ),
                        ]
                      ),
                    ]
                  : v.fallback
                    ? convertVariableDefinition(
                        v.name,
                        v.fallback.expression,
                        ctx,
                        indicator,
                        ref("j")
                      )
                    : [stmt(bin(ref(`this.${v.name}[j]`), "=", lit("0")))]),
              ]
            ),
          ];
        } else {
          return convertVariableDefinition(v.name, v.expression, ctx, indicator, ref("j"));
        }
      })
    ),
    ...(DEBUG
      ? variables.map((v) =>
          callStmt("Print", [
            `"After update ${v.name}: "`,
            `${v.name}[i]`,
            '", "',
            ternary("i + 1 < Bars - 1", `${v.name}[i + 1]`, 0),
            '", "',
            ternary("i + 2 < Bars - 1", `${v.name}[i + 2]`, 0),
          ])
        )
      : []),
    // 最後に lastCalculated を更新
    stmt(
      bin(
        ref("this.lastCalculated"),
        "=",
        call("MathMin", [bin(ref("Bars"), "-", lit("1")), ref("end + 1")])
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
        iff("this.lastCalculated == -1 || i <= this.lastCalculated", [
          callStmt("this.Update", [
            ref("i"),
            ...params.filter((p) => p.type === "source").map((p) => ref(p.name)),
          ]),
        ]),
        ...exports.flatMap((e) => {
          return [
            iff(bin("lineName", "==", `"${e.name}"`), [ret(ref(`this.${e.variableName}[i]`))]),
          ];
        }),
        ret("-1"),
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
      name,
      variables.map((v) => {
        return callStmt("ArrayFree", [ref(`this.${v.name}`)]);
      })
    )
  );

  return new MqlClass(name, fields, methods);
}

function convertVariableExpression(
  expr: VariableExpression | IndicatorExpression,
  ctx: IndicatorContext,
  shift?: MqlExpression
): MqlExpression {
  switch (expr.type) {
    case "constant":
      return lit(expr.value.toString());

    case "param":
      return ref(`this.${expr.name}`);

    case "source": {
      const shiftExpr = expr.shiftBars
        ? shift
          ? bin(shift, "+", convertVariableExpression(expr.shiftBars, ctx))
          : convertVariableExpression(expr.shiftBars, ctx)
        : shift || lit("0");
      return ternary(
        bin("Bars", ">", shiftExpr),
        lit(`${expr.name}[${shiftExpr}]`),
        expr.fallback ? convertVariableExpression(expr.fallback, ctx) : lit("0")
      );
    }

    case "variable": {
      const shiftExpr = expr.shiftBars
        ? shift
          ? bin(shift, "+", convertVariableExpression(expr.shiftBars, ctx))
          : convertVariableExpression(expr.shiftBars, ctx)
        : shift || lit("0");
      return ternary(
        bin("Bars", ">", shiftExpr),
        lit(`this.${expr.name}[${shiftExpr}]`),
        expr.fallback ? convertVariableExpression(expr.fallback, ctx) : lit("0")
      );
    }

    case "binary_op":
      return bin(
        convertVariableExpression(expr.left, ctx, shift),
        expr.operator,
        convertVariableExpression(expr.right, ctx, shift)
      );

    case "unary_op":
      return unary(expr.operator, convertVariableExpression(expr.operand, ctx, shift));

    case "ternary":
      return ternary(
        bin(
          convertVariableExpression(expr.condition.left, ctx, shift),
          expr.condition.operator,
          convertVariableExpression(expr.condition.right, ctx, shift)
        ),
        convertVariableExpression(expr.trueExpr, ctx, shift),
        convertVariableExpression(expr.falseExpr, ctx, shift)
      );

    case "indicator":
      return ctx.getVariableRef(expr);

    default:
      throw new Error("Unsupported VariableExpression type: " + JSON.stringify(expr));
  }
}

function convertAggregationMethodArgs(
  expr: AggregationExpression,
  ctx: IndicatorContext,
  shift: MqlVariableRef
) {
  switch (expr.source.type) {
    case "source": {
      const period = convertVariableExpression(expr.period, ctx);
      return [
        expr.source.name,
        expr.source.shiftBars
          ? bin(shift, "+", convertVariableExpression(expr.source.shiftBars, ctx))
          : shift,
        period.toString() === "0"
          ? bin(
              "Bars",
              "-",
              expr.source.shiftBars
                ? bin(shift, "+", convertVariableExpression(expr.source.shiftBars, ctx))
                : shift
            )
          : period,
      ];
    }
    case "variable": {
      const period = convertVariableExpression(expr.period, ctx);
      return [
        `this.${expr.source.name}`,
        expr.source.shiftBars
          ? bin(shift, "+", convertVariableExpression(expr.source.shiftBars, ctx))
          : shift,
        period.toString() === "0"
          ? bin(
              "Bars",
              "-",
              expr.source.shiftBars
                ? bin(shift, "+", convertVariableExpression(expr.source.shiftBars, ctx))
                : shift
            )
          : period,
      ];
    }
  }
  throw new Error("unexpected aggregation source type");
}
function callAggregationMethod(
  name: string,
  expr: AggregationExpression,
  ctx: IndicatorContext,
  indicator: Indicator,
  shift: MqlVariableRef
): MqlStatement[] {
  const method = expr.method;
  if (method.type === "aggregationType") {
    return [
      stmt(
        bin(
          ref(`this.${name}[${shift}]`),
          "=",
          call(`this.${method.value}`, convertAggregationMethodArgs(expr, ctx, shift))
        )
      ),
    ];
  } else if (method.type === "param") {
    const param = indicator.params.find(
      (p) => p.type === "aggregationType" && p.name === method.name
    ) as AggregationTypeIndicatorParam;
    return param.selectableTypes.map((t) =>
      iff(bin(param.name, "==", `"${t}"`), [
        stmt(
          bin(
            ref(`this.${name}[${shift}]`),
            "=",
            call(`this.${t}`, convertAggregationMethodArgs(expr, ctx, shift))
          )
        ),
      ])
    );
  }
  throw new Error("Function not implemented.");
}

function convertVariableDefinition(
  name: string,
  e: AggregationExpression | IndicatorExpression | VariableExpression,
  ctx: IndicatorContext,
  indicator: Indicator,
  shift: MqlVariableRef
): MqlStatement[] {
  if (e.type === "aggregation") {
    return callAggregationMethod(name, e, ctx, indicator, shift);
  } else {
    return [stmt(bin(ref(`this.${name}[j]`), "=", convertVariableExpression(e, ctx, shift)))];
  }
}
