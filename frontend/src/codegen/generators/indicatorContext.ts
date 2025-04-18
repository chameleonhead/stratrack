import {
  MqlBinaryExpr,
  MqlClass,
  MqlExpression,
  MqlExprStatement,
  MqlFunctionCallExpr,
  MqlGlobalVariable,
  MqlLiteral,
  MqlStatement,
  MqlVariableRef,
} from "../ast/mql/mqlast";
import { IndicatorExpression } from "../dsl/common";
import { Indicator } from "../dsl/indicator";
import { generateClassFromIndicator } from "./mqlIndGenerator";

export class IndicatorContext {
  private indicators: Record<string, Indicator>;
  private instances: Record<string, { variableName: string; expr: IndicatorExpression }>;
  private counter: number;

  constructor(indicators: Indicator[]) {
    this.indicators = {};
    indicators.forEach((v) => (this.indicators[v.name] = v));
    this.instances = {};
    this.counter = 0;
  }

  getVariableRef(expr: IndicatorExpression): MqlExpression {
    const key = this.hash(expr);
    if (!(key in this.instances)) {
      const variableName = `ind${++this.counter}`;
      this.instances[key] = { variableName, expr };
    }
    return new MqlFunctionCallExpr(`${this.instances[key].variableName}.Get`, [
      new MqlLiteral(`"${expr.lineName}"`),
      new MqlVariableRef("i"),
      ...expr.params
        .filter((p) => p.type === "source")
        .map((p) => new MqlVariableRef(p.value as string)),
    ]);
  }

  generateIndicatorDeclarations(): {
    classes: MqlClass[];
    globals: MqlGlobalVariable[];
    init: MqlStatement[];
    deinit: MqlStatement[];
  } {
    const classes: MqlClass[] = [];
    const globals: MqlGlobalVariable[] = [];
    const init: MqlStatement[] = [];
    const deinit: MqlStatement[] = [];

    for (const { variableName, expr } of Object.values(this.instances)) {
      const indicator = this.indicators[expr.name];
      if (!indicator?.template) {
        throw new Error(`Template not found for indicator: ${expr.name}`);
      }

      const className = this.pascal(expr.name);
      // クラス定義を追加（重複しないようチェック）
      if (!classes.find((c) => c.name === className)) {
        const cls = generateClassFromIndicator(className, indicator, this);
        classes.push(cls);
      }

      // グローバルポインタ
      globals.push(new MqlGlobalVariable(variableName, `${className}*`));

      // インスタンス生成
      init.push(
        new MqlExprStatement(
          new MqlBinaryExpr(
            new MqlVariableRef(variableName),
            "=",
            new MqlFunctionCallExpr(
              `new ${className}`,
              expr.params
                .filter((p) => p.type === "number" || p.type === "aggregationType")
                .map((p) =>
                  p.type === "number"
                    ? new MqlLiteral(p.value?.toString() || "")
                    : new MqlLiteral(`"${p.value?.toString() || ""}"`)
                )
            )
          )
        )
      );

      // 解放処理
      deinit.push(
        new MqlExprStatement(new MqlFunctionCallExpr("delete", [new MqlVariableRef(variableName)]))
      );
    }

    return { classes, globals, init, deinit };
  }
  pascal(snake: string): string {
    return snake
      .split("_")
      .filter(Boolean) // 空文字を除去（例: __abc）
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  private hash(expr: IndicatorExpression): string {
    const sortedParams = Object.entries(expr.params || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(",");
    return `${expr.name}(${sortedParams})`;
  }
}
