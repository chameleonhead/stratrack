import {
  MqlBinaryExpr,
  MqlClass,
  MqlExpression,
  MqlExprStatement,
  MqlFunctionCall,
  MqlFunctionCallExpr,
  MqlGlobalVariable,
  MqlLiteral,
  MqlStatement,
  MqlVariableRef,
} from "../../codegen/mql/mqlast";
import { Indicator, IndicatorExpression } from "../../indicators/types";
import { generateClassFromIndicator } from "./malIndGenerator";

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
    expr.params.forEach((p) => {
      if (p.type === "aggregationType") {
      }
    });
    return new MqlFunctionCallExpr(`${this.instances[key].variableName}->Get`, [
      new MqlLiteral(`"${expr.lineName}"`),
      new MqlVariableRef("i"),
    ]);
  }

  generateIndicatorDeclarations(): {
    classes: MqlClass[];
    globals: MqlGlobalVariable[];
    init: MqlStatement[];
    tick: MqlStatement[];
    deinit: MqlStatement[];
  } {
    const classes: MqlClass[] = [];
    const globals: MqlGlobalVariable[] = [];
    const init: MqlStatement[] = [];
    const tick: MqlStatement[] = [];
    const deinit: MqlStatement[] = [];

    for (const { variableName, expr } of Object.values(this.instances)) {
      const indicator = this.indicators[expr.name];
      if (!indicator?.template) {
        throw new Error(`Template not found for indicator: ${expr.name}`);
      }

      const className = this.pascal(expr.name);
      // クラス定義を追加（重複しないようチェック）
      if (!classes.find((c) => c.name === expr.name)) {
        const cls = generateClassFromIndicator(className, indicator, this);
        classes.push(cls);
      }

      // グローバルポインタ
      globals.push(new MqlGlobalVariable(variableName, `${className}*`));

      // コンストラクタ引数（params）
      const args: MqlExpression[] = [];
      for (const param of expr.params) {
        const val = param.value;
        if (param.type === "source") {
          args.push(new MqlLiteral(val.toString()));
        } else if (typeof val === "string") {
          args.push(new MqlVariableRef(val)); // param 参照（例: period）
        }
      }

      // インスタンス生成
      init.push(
        new MqlExprStatement(
          new MqlBinaryExpr(
            new MqlVariableRef(variableName),
            "=",
            new MqlFunctionCallExpr(`new ${className}`, args)
          )
        )
      );

      // 更新処理
      tick.push(new MqlFunctionCall(`${variableName}->Update`, []));

      // 解放処理
      deinit.push(
        new MqlExprStatement(new MqlFunctionCallExpr("delete", [new MqlVariableRef(variableName)]))
      );
    }

    return { classes, globals, init, tick, deinit };
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
      .map(([k, v]) => `${k}=${v}`)
      .join(",");
    return `${expr.name}(${sortedParams})`;
  }
}
