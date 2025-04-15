import {
  MqlArgument,
  MqlBinaryExpr,
  MqlClass,
  MqlClassField,
  MqlClassMethod,
  MqlConstructor,
  MqlDecl,
  MqlDestructor,
  MqlExpression,
  MqlExprStatement,
  MqlFor,
  MqlFunctionCallExpr,
  MqlIf,
  MqlLiteral,
  MqlReturn,
  MqlStatement,
  MqlTernaryExpr,
  MqlUnaryExpr,
  MqlVariableRef,
} from "../../codegen/mql/mqlast";
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

const aggregationMethodMapForClass: Record<AggregationType, MqlClassMethod> = {
  sma: new MqlClassMethod(
    "sma",
    "double",
    [
      new MqlDecl("sum", "double", new MqlLiteral("0")),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("0")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlExprStatement(
            new MqlBinaryExpr(new MqlVariableRef("sum"), "+=", new MqlVariableRef("src[i + j]"))
          ),
        ]
      ),
      new MqlReturn(
        new MqlBinaryExpr(new MqlVariableRef("sum"), "/", new MqlVariableRef("p"))
      ),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  ema: new MqlClassMethod(
    "ema",
    "double",
    [
      new MqlDecl("alpha", "double", "2.0 / (p + 1)"),
      new MqlDecl("emaValue", "double", "src[i + p - 1]"),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("p - 2")),
        new MqlBinaryExpr(new MqlVariableRef("j"), ">=", new MqlLiteral("0")),
        new MqlExprStatement(new MqlUnaryExpr("--", new MqlVariableRef("j"))),
        [
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef("emaValue"),
              "=",
              new MqlBinaryExpr(
                new MqlBinaryExpr(new MqlLiteral("alpha"), "*", new MqlVariableRef("src[i + j]")),
                "+",
                new MqlBinaryExpr(
                  new MqlLiteral("(1 - alpha)"),
                  "*",
                  new MqlVariableRef("emaValue")
                )
              )
            )
          ),
        ]
      ),
      new MqlReturn(new MqlVariableRef("emaValue")),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  rma: new MqlClassMethod(
    "rma",
    "double",
    [
      new MqlDecl("value", "double", "src[i + p - 1]"),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("p - 2")),
        new MqlBinaryExpr(new MqlVariableRef("j"), ">=", new MqlLiteral("0")),
        new MqlExprStatement(new MqlUnaryExpr("--", new MqlVariableRef("j"))),
        [
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef("value"),
              "=",
              new MqlBinaryExpr(
                new MqlBinaryExpr(new MqlVariableRef("value"), "*", new MqlLiteral("(p - 1)")),
                "+",
                new MqlVariableRef("src[i + j]")
              )
            )
          ),
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef("value"),
              "=",
              new MqlBinaryExpr(new MqlVariableRef("value"), "/", new MqlVariableRef("p"))
            )
          ),
        ]
      ),
      new MqlReturn(new MqlVariableRef("value")),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  lwma: new MqlClassMethod(
    "lwma",
    "double",
    [
      new MqlDecl("weightedSum", "double", "0"),
      new MqlDecl("totalWeight", "double", "0"),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("0")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlDecl(
            "weight",
            "int",
            new MqlBinaryExpr(new MqlVariableRef("p"), "-", new MqlVariableRef("j"))
          ),
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef("weightedSum"),
              "+=",
              new MqlBinaryExpr(new MqlVariableRef("src[i + j]"), "*", new MqlVariableRef("weight"))
            )
          ),
          new MqlExprStatement(
            new MqlBinaryExpr(new MqlVariableRef("totalWeight"), "+=", new MqlVariableRef("weight"))
          ),
        ]
      ),
      new MqlReturn(
        new MqlBinaryExpr(new MqlVariableRef("weightedSum"), "/", new MqlVariableRef("totalWeight"))
      ),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  smma: new MqlClassMethod(
    "smma",
    "double",
    [
      new MqlDecl("value", "double", "src[i + p - 1]"),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("p - 2")),
        new MqlBinaryExpr(new MqlVariableRef("j"), ">=", new MqlLiteral("0")),
        new MqlExprStatement(new MqlUnaryExpr("--", new MqlVariableRef("j"))),
        [
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef("value"),
              "=",
              new MqlBinaryExpr(
                new MqlBinaryExpr(new MqlVariableRef("value"), "*", new MqlLiteral("(p - 1)")),
                "+",
                new MqlVariableRef("src[i + j]")
              )
            )
          ),
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef("value"),
              "=",
              new MqlBinaryExpr(new MqlVariableRef("value"), "/", new MqlVariableRef("p"))
            )
          ),
        ]
      ),
      new MqlReturn(new MqlVariableRef("value")),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  sum: new MqlClassMethod(
    "sum",
    "double",
    [
      new MqlDecl("total", "double", new MqlLiteral("0")),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("0")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlExprStatement(
            new MqlBinaryExpr(new MqlVariableRef("total"), "+=", new MqlVariableRef("src[i + j]"))
          ),
        ]
      ),
      new MqlReturn(new MqlVariableRef("total")),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  std: new MqlClassMethod(
    "std",
    "double",
    [
      new MqlDecl("sum", "double", "0"),
      new MqlDecl("sumSq", "double", "0"),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("0")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlDecl("v", "double", new MqlVariableRef("src[i + j]")),
          new MqlExprStatement(
            new MqlBinaryExpr(new MqlVariableRef("sum"), "+=", new MqlVariableRef("v"))
          ),
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef("sumSq"),
              "+=",
              new MqlBinaryExpr(new MqlVariableRef("v"), "*", new MqlVariableRef("v"))
            )
          ),
        ]
      ),
      new MqlDecl(
        "mean",
        "double",
        new MqlBinaryExpr(new MqlVariableRef("sum"), "/", new MqlVariableRef("p"))
      ),
      new MqlReturn(
        new MqlFunctionCallExpr("MathSqrt", [
          new MqlBinaryExpr(
            new MqlBinaryExpr(new MqlVariableRef("sumSq"), "/", new MqlVariableRef("p")),
            "-",
            new MqlBinaryExpr(new MqlVariableRef("mean"), "*", new MqlVariableRef("mean"))
          ),
        ])
      ),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  max: new MqlClassMethod(
    "max",
    "double",
    [
      new MqlExprStatement(new MqlLiteral("double m = src[i];")),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("1")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlIf(
            new MqlBinaryExpr(new MqlVariableRef("src[i + j]"), ">", new MqlVariableRef("m")),
            [
              new MqlExprStatement(
                new MqlBinaryExpr(new MqlVariableRef("m"), "=", new MqlVariableRef("src[i + j]"))
              ),
            ]
          ),
        ]
      ),
      new MqlReturn(new MqlVariableRef("m")),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),
  min: new MqlClassMethod(
    "min",
    "double",
    [
      new MqlExprStatement(new MqlLiteral("double m = src[i];")),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("1")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlIf(
            new MqlBinaryExpr(new MqlVariableRef("src[i + j]"), "<", new MqlVariableRef("m")),
            [
              new MqlExprStatement(
                new MqlBinaryExpr(new MqlVariableRef("m"), "=", new MqlVariableRef("src[i + j]"))
              ),
            ]
          ),
        ]
      ),
      new MqlReturn(new MqlVariableRef("m")),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  median: new MqlClassMethod(
    "median",
    "double",
    [
      // バッファ確保
      new MqlDecl("tmp[]", "double"),
      new MqlExprStatement(
        new MqlFunctionCallExpr("ArrayResize", [
          new MqlVariableRef("tmp"),
          new MqlVariableRef("p"),
        ])
      ),

      // コピー
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("0")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlExprStatement(
            new MqlBinaryExpr(new MqlVariableRef("tmp[j]"), "=", new MqlVariableRef("src[i + j]"))
          ),
        ]
      ),

      // ソート
      new MqlExprStatement(new MqlFunctionCallExpr("ArraySort", [new MqlVariableRef("tmp")])),

      // 奇数/偶数チェック
      new MqlIf(
        new MqlBinaryExpr(
          new MqlBinaryExpr(new MqlVariableRef("p"), "%", new MqlLiteral("2")),
          "==",
          new MqlLiteral("0")
        ),
        [
          new MqlReturn(
            new MqlBinaryExpr(
              new MqlBinaryExpr(
                new MqlVariableRef("tmp[p / 2 - 1]"),
                "+",
                new MqlVariableRef("tmp[p / 2]")
              ),
              "/",
              new MqlLiteral("2.0")
            )
          ),
        ],
        [new MqlReturn(new MqlVariableRef("tmp[p / 2]"))]
      ),
      new MqlExprStatement(new MqlFunctionCallExpr("ArrayFree", [new MqlVariableRef("tmp")])),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
    "private"
  ),

  mean_absolute_deviation: new MqlClassMethod(
    "mean_absolute_deviation",
    "double",
    [
      // 合計を求めて平均を出す
      new MqlDecl("sum", "double”,”0"),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("0")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlExprStatement(
            new MqlBinaryExpr(new MqlVariableRef("sum"), "+=", new MqlVariableRef("src[i + j]"))
          ),
        ]
      ),
      new MqlDecl(
        "mean",
        "double",
        new MqlBinaryExpr(new MqlVariableRef("sum"), "/", new MqlVariableRef("p"))
      ),

      // 平均との絶対偏差
      new MqlExprStatement(new MqlLiteral("double mad = 0;")),
      new MqlFor(
        new MqlDecl("j", "int", new MqlLiteral("0")),
        new MqlBinaryExpr(new MqlVariableRef("j"), "<", new MqlVariableRef("p")),
        new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("j"))),
        [
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef("mad"),
              "+=",
              new MqlFunctionCallExpr("MathAbs", [
                new MqlBinaryExpr(
                  new MqlVariableRef("src[i + j]"),
                  "-",
                  new MqlVariableRef("mean")
                ),
              ])
            )
          ),
        ]
      ),

      new MqlReturn(
        new MqlBinaryExpr(new MqlVariableRef("mad"), "/", new MqlVariableRef("p"))
      ),
    ],
    [
      new MqlArgument("&src[]", "const double"),
      new MqlArgument("i", "int"),
      new MqlArgument("p", "int"),
    ],
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
    .concat(params.filter((p) => p.type == "aggregationType").flatMap((p) => p.selectableTypes))
    .filter((value, index, array) => array.indexOf(value) === index);
  // --- フィールド定義 ---
  variables.forEach((v) => {
    fields.push(new MqlClassField(`${v.name}[]`, "double", "private"));
  });
  fields.push(new MqlClassField("lastCalculated", "int", "private"));

  // --- パラメータをフィールドとして持つ（自動） ---
  for (const p of params) {
    if (!fields.find((f) => f.name === p.name)) {
      switch (p.type) {
        case "number":
          fields.push(new MqlClassField(p.name, "int", "private"));
          break;
        case "aggregationType":
          fields.push(new MqlClassField(p.name, "string", "private"));
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
          return new MqlArgument(p.name, "int");
        case "aggregationType":
          return new MqlArgument(p.name, "string");
      }
    });
  const constructorBody: MqlStatement[] = [
    new MqlExprStatement(new MqlBinaryExpr("this.lastCalculated", "=", 0)),
    ...params
      .filter((p) => p.type === "number" || p.type === "aggregationType")
      .map((p) => {
        switch (p.type) {
          case "number":
          case "aggregationType":
            return new MqlExprStatement(
              new MqlBinaryExpr(
                new MqlVariableRef(`this.${p.name}`),
                "=",
                new MqlVariableRef(p.name)
              )
            );
        }
      }),
    ...variables.map(
      (v) =>
        new MqlExprStatement(
          new MqlFunctionCallExpr("ArraySetAsSeries", [
            new MqlVariableRef(v.name),
            new MqlLiteral("true"),
          ])
        )
    ),
  ];
  methods.push(new MqlConstructor(name, constructorBody, constructorArgs));

  // --- Update メソッド（変数式の評価） ---
  const updateBody: MqlStatement[] = [];

  updateBody.push(
    ...variables.map(
      (v) =>
        new MqlExprStatement(
          new MqlFunctionCallExpr("ArrayResize", [
            new MqlVariableRef(v.name),
            new MqlLiteral("Bars"),
          ])
        )
    )
  );

  // start = max(lastCalculated, period)
  updateBody.push(new MqlDecl("limit", "int", new MqlLiteral("Bars - 1")));
  updateBody.push(
    new MqlDecl(
      "start",
      "int",
      new MqlFunctionCallExpr("MathMax", [
        new MqlVariableRef("lastCalculated"),
        new MqlVariableRef("period"),
      ])
    )
  );

  // メイン計算ループ
  updateBody.push(
    new MqlFor(
      new MqlDecl("i", "int", new MqlVariableRef("start")),
      new MqlBinaryExpr(new MqlVariableRef("i"), "<=", new MqlVariableRef("limit")),
      new MqlExprStatement(new MqlUnaryExpr("++", new MqlVariableRef("i"))),
      // 計算本体（sum / period）
      variables.flatMap((v) => {
        if (v.expression.type === "aggregation") {
          return callAggregationMethod(v.name, v.expression, ctx, indicator);
        } else {
          return new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef(`this.${v.name}[i]`),
              "=",
              convertVariableExpression(v.expression, ctx)
            )
          );
        }
      })
    )
  );

  // 最後に lastCalculated を更新
  updateBody.push(
    new MqlExprStatement(
      new MqlBinaryExpr(
        new MqlVariableRef("lastCalculated"),
        "=",
        new MqlBinaryExpr(new MqlVariableRef("limit"), "+", new MqlLiteral("1"))
      )
    )
  );

  methods.push(
    new MqlClassMethod(
      "Update",
      "void",
      updateBody,
      params
        .filter((p) => p.type === "source")
        .map((p) => new MqlArgument(`&${p.name}[]`, "double"))
    )
  );

  // --- Get メソッド ---
  methods.push(
    new MqlClassMethod(
      "Get",
      "double",
      [
        ...exports.flatMap((e) => {
          return [
            new MqlIf(new MqlBinaryExpr("lineName", "==", `"${e.name}"`), [
              new MqlReturn(new MqlVariableRef(`${e.variableName}[i]`)),
            ]),
          ];
        }),
        new MqlReturn("-1"),
      ],
      [new MqlArgument("lineName", "string"), new MqlArgument("i", "int")]
    )
  );

  // --- デストラクタ ---
  methods.push(
    new MqlDestructor(
      name,
      variables.map((v) => {
        return new MqlExprStatement(
          new MqlFunctionCallExpr("ArrayFree", [new MqlVariableRef(v.name)])
        );
      })
    )
  );

  return new MqlClass(name, fields, methods);
}

function convertVariableExpression(
  expr: VariableExpression | IndicatorExpression,
  ctx: IndicatorContext
): MqlExpression {
  switch (expr.type) {
    case "constant":
      return new MqlLiteral(expr.value.toString());

    case "param":
      return new MqlVariableRef(expr.name);

    case "source": {
      const indexExpr = expr.shiftBars
        ? convertVariableExpression(expr.shiftBars, ctx)
        : new MqlLiteral("0");

      return new MqlLiteral(`${expr.name}[${indexExpr}]`);
    }

    case "variable": {
      const shiftExpr = expr.shiftBars
        ? convertVariableExpression(expr.shiftBars, ctx)
        : new MqlLiteral("0");

      return new MqlLiteral(`this.${expr.name}[${shiftExpr}]`);
    }

    case "binary_op":
      return new MqlBinaryExpr(
        convertVariableExpression(expr.left, ctx),
        expr.operator,
        convertVariableExpression(expr.right, ctx)
      );

    case "unary_op":
      return new MqlUnaryExpr(expr.operator, convertVariableExpression(expr.operand, ctx));

    case "ternary":
      return new MqlTernaryExpr(
        new MqlBinaryExpr(
          convertVariableExpression(expr.condition.left, ctx),
          expr.condition.operator,
          convertVariableExpression(expr.condition.right, ctx)
        ),
        convertVariableExpression(expr.trueExpr, ctx),
        convertVariableExpression(expr.falseExpr, ctx)
      );

    case "indicator":
      return ctx.getVariableRef(expr);

    default:
      throw new Error("Unsupported VariableExpression type: " + JSON.stringify(expr));
  }
}

function convertAggregationMethodArgs(expr: AggregationExpression, ctx: IndicatorContext) {
  switch (expr.source.type) {
    case "source":
      return [
        expr.source.name,
        expr.source.shiftBars ? convertVariableExpression(expr.source.shiftBars, ctx) : 0,
        convertVariableExpression(expr.period, ctx),
      ];
    case "variable":
      return [
        `this.${expr.source.name}`,
        expr.source.shiftBars ? convertVariableExpression(expr.source.shiftBars, ctx) : 0,
        convertVariableExpression(expr.period, ctx),
      ];
  }
  throw new Error("unexpected aggregation source type");
}
function callAggregationMethod(
  name: string,
  expr: AggregationExpression,
  ctx: IndicatorContext,
  indicator: Indicator
): MqlStatement[] {
  const method = expr.method;
  if (method.type === "aggregationType") {
    return [
      new MqlExprStatement(
        new MqlBinaryExpr(
          new MqlVariableRef(`this.${name}[i]`),
          "=",
          new MqlFunctionCallExpr(method.value, convertAggregationMethodArgs(expr, ctx))
        )
      ),
    ];
  } else if (method.type === "param") {
    const param = indicator.params.find(
      (p) => p.type === "aggregationType" && p.name === method.name
    ) as AggregationTypeIndicatorParam;
    return param.selectableTypes.map(
      (t) =>
        new MqlIf(new MqlBinaryExpr(param.name, "==", `"${t}"`), [
          new MqlExprStatement(
            new MqlBinaryExpr(
              new MqlVariableRef(`this.${name}[i]`),
              "=",
              new MqlFunctionCallExpr(t, convertAggregationMethodArgs(expr, ctx))
            )
          ),
        ])
    );
  }
  throw new Error("Function not implemented.");
}
