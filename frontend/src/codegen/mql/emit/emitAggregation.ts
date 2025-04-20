import { AggregationType } from "../../dsl/common";
import { MqlClassMethod } from "../ast";
import {
  method,
  declStmt,
  lit,
  loop,
  binary,
  ref,
  stmt,
  unary,
  ret,
  arg,
  call,
  iff,
  callStmt,
} from "../helper";

export const aggregationMethodMapForClass: Record<AggregationType, MqlClassMethod> = {
  sma: method(
    "sma",
    "double",
    [
      declStmt("sum", "double", lit("0")),
      loop(
        declStmt("j", "int", lit("0")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [stmt(binary("+=", ref("sum"), ref("src[i + j]")))]
      ),
      ret(binary("/", ref("sum"), ref("p"))),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  ema: method(
    "ema",
    "double",
    [
      declStmt("alpha", "double", lit("2.0 / (p + 1)")),
      declStmt("emaValue", "double", lit("src[i + p - 1]")),
      loop(
        declStmt("j", "int", lit("p - 2")),
        binary(">=", ref("j"), lit("0")),
        stmt(unary("--", ref("j"))),
        [
          stmt(
            binary(
              "=",
              ref("emaValue"),
              binary(
                "+",
                binary("*", lit("alpha"), ref("src[i + j]")),
                binary("*", lit("(1 - alpha)"), ref("emaValue"))
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
      declStmt("value", "double", lit("src[i + p - 1]")),
      loop(
        declStmt("j", "int", lit("p - 2")),
        binary(">=", ref("j"), lit("0")),
        stmt(unary("--", ref("j"))),
        [
          stmt(
            binary(
              "=",
              ref("value"),
              binary("+", binary("*", ref("value"), lit("(p - 1)")), ref("src[i + j]"))
            )
          ),
          stmt(binary("=", ref("value"), binary("/", ref("value"), ref("p")))),
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
      declStmt("weightedSum", "double", lit("0")),
      declStmt("totalWeight", "double", lit("0")),
      loop(
        declStmt("j", "int", lit("0")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [
          declStmt("weight", "int", binary("-", ref("p"), ref("j"))),
          stmt(binary("+=", ref("weightedSum"), binary("*", ref("src[i + j]"), ref("weight")))),
          stmt(binary("+=", ref("totalWeight"), ref("weight"))),
        ]
      ),
      ret(binary("/", ref("weightedSum"), ref("totalWeight"))),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  smma: method(
    "smma",
    "double",
    [
      declStmt("value", "double", lit("src[i + p - 1]")),
      loop(
        declStmt("j", "int", lit("p - 2")),
        binary(">=", ref("j"), lit("0")),
        stmt(unary("--", ref("j"))),
        [
          stmt(
            binary(
              "=",
              ref("value"),
              binary("+", binary("*", ref("value"), lit("(p - 1)")), ref("src[i + j]"))
            )
          ),
          stmt(binary("=", ref("value"), binary("/", ref("value"), ref("p")))),
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
      declStmt("total", "double", lit("0")),
      loop(
        declStmt("j", "int", lit("0")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [stmt(binary("+=", ref("total"), ref("src[i + j]")))]
      ),
      ret(ref("total")),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),

  std: method(
    "std",
    "double",
    [
      declStmt("sum", "double", lit("0")),
      declStmt("sumSq", "double", lit("0")),
      loop(
        declStmt("j", "int", lit("0")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [
          declStmt("v", "double", ref("src[i + j]")),
          stmt(binary("+=", ref("sum"), ref("v"))),
          stmt(binary("+=", ref("sumSq"), binary("*", ref("v"), ref("v")))),
        ]
      ),
      declStmt("mean", "double", binary("/", ref("sum"), ref("p"))),
      ret(
        call("MathSqrt", [
          binary("-", binary("/", ref("sumSq"), ref("p")), binary("*", ref("mean"), ref("mean"))),
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
      loop(
        declStmt("j", "int", lit("1")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [
          iff(binary(">", ref("src[i + j]"), ref("m")), [
            stmt(binary("=", ref("m"), ref("src[i + j]"))),
          ]),
        ]
      ),
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
      loop(
        declStmt("j", "int", lit("1")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [
          iff(binary("<", ref("src[i + j]"), ref("m")), [
            stmt(binary("=", ref("m"), ref("src[i + j]"))),
          ]),
        ]
      ),
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
      declStmt("tmp[]", "double"),
      callStmt("ArrayResize", [ref("tmp"), ref("p")]),

      // コピー
      loop(
        declStmt("j", "int", lit("0")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [stmt(binary("=", ref("tmp[j]"), ref("src[i + j]")))]
      ),

      // ソート
      callStmt("ArraySort", [ref("tmp")]),

      // 奇数/偶数チェック
      iff(
        binary("==", binary("%", ref("p"), lit("2")), lit("0")),
        [ret(binary("/", binary("+", ref("tmp[p / 2 - 1]"), ref("tmp[p / 2]")), lit("2.0")))],
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
      declStmt("sum", "double", lit("0")),
      loop(
        declStmt("j", "int", lit("0")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [stmt(binary("+=", ref("sum"), ref("src[i + j]")))]
      ),
      declStmt("mean", "double", binary("/", ref("sum"), ref("p"))),

      // 平均との絶対偏差
      stmt(lit("double mad = 0;")),
      loop(
        declStmt("j", "int", lit("0")),
        binary("<", ref("j"), ref("p")),
        stmt(unary("++", ref("j"))),
        [
          stmt(
            binary("+=", ref("mad"), call("MathAbs", [binary("-", ref("src[i + j]"), ref("mean"))]))
          ),
        ]
      ),

      ret(binary("/", ref("mad"), ref("p"))),
    ],
    [arg("&src[]", "const double"), arg("i", "int"), arg("p", "int")],
    "private"
  ),
};
