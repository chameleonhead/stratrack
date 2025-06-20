import { describe, it, expect, beforeAll } from "vitest";
import {
  IRComparisonCondition,
  IRIndicatorDefinition,
  IRIndicatorInstance,
  IRProgram,
} from "./ast";
import { analyzeStrategyWithDependencies } from "../analyzers";
import { StrategyTemplate } from "../dsl/strategy";
import { buildIRFromAnalysis } from "./builder";
import { MA } from "../../features/indicators/indicators";

describe("buildIRFromAnalysis", () => {
  // テストで使用する戦略とIRProgramをスコープ外で定義
  let strategyTemplate: StrategyTemplate;
  let irProgram: IRProgram;

  beforeAll(() => {
    // 期間5のSMAインジケーターを作成（終値を対象）
    const smaPeriod = 5;
    // SMAインジケーターのインスタンスを生成します（仮の構文。実際の実装に合わせてインジケーターを生成してください）
    const smaIndicator = MA;

    // 戦略テンプレートを定義します
    strategyTemplate = {
      // 戦略内で使用する変数を定義（キーが変数名、値にインジケーターインスタンスを割り当て）
      variables: [
        {
          name: "fastSMA", // 変数名
          expression: {
            type: "indicator",
            name: smaIndicator.name, // インジケーター名
            params: [
              { type: "number", name: "period", value: smaPeriod }, // SMAの期間を指定
              {
                type: "source",
                name: "source",
                ref: { type: "variable", name: "close" },
              }, // 終値を指定
              {
                type: "aggregationType",
                name: "method",
                method: "sma",
              }, // 終値を指定
            ],
            lineName: "ma",
          },
        },
        {
          name: "close", // 終値を表す変数名
          expression: {
            type: "scalar_price",
            source: "close",
          },
        },
      ],
      // エントリー条件の定義: 「終値 > fastSMA」の単一条件
      entry: [
        {
          type: "long",
          condition: {
            type: "comparison", // 比較条件
            left: { type: "scalar_price", source: "close" },
            operator: ">",
            right: {
              type: "bar_shift",
              source: { type: "variable", name: "fastSMA" },
            },
          },
        },
      ],
      exit: [],
      riskManagement: { type: "percentage", /** 口座資金に対する割合(%) */ percent: 100 },
    };

    // 戦略テンプレートを解析して依存するインジケーターを解決
    const analysis = analyzeStrategyWithDependencies(strategyTemplate, {
      [smaIndicator.name]: smaIndicator,
    });
    expect(analysis.errors.length).toBe(0);
    // 解析結果から IRProgram を構築（エラーなく実行できることも確認）
    irProgram = buildIRFromAnalysis(analysis);
  });

  it("IRProgram に戦略が正しく設定されていることを確認する", () => {
    expect(irProgram).toBeDefined();
    const strategy = irProgram.strategy;
    expect(strategy).toBeDefined();

    // 変数名の検証（戦略で使用した変数 fastSMA および 終値 close の変数が含まれること）
    const variableNames = strategy.variables.map((v) => v.name);
    expect(variableNames).toContain("fastSMA"); // SMA出力の変数名
    expect(variableNames.find((name) => name.toLowerCase().includes("close"))).toBeDefined(); // 終値を表す変数が存在すること（例: "close" 等を含む名前）

    // エントリー条件の検証（単一のエントリー条件が正しく設定されていること）
    // IRProgram内のエントリー条件オブジェクトを取得
    const entryCondition = strategy.entryConditions[0] as {
      type: "long";
      condition: IRComparisonCondition;
    };
    expect(entryCondition.type).toBe("long");
    expect(entryCondition.condition).toBeDefined();
    expect(entryCondition.condition.type).toBe("comparison");
    expect(entryCondition.condition.operator).toBe(">");
    expect(entryCondition.condition.left).toEqual({
      type: "bar_shift",
      source: {
        source: "close",
        type: "price_ref",
      },
      shiftBar: {
        type: "constant",
        value: 0,
      },
      fallback: {
        type: "constant",
        value: 0,
      },
    });
    expect(entryCondition.condition.right).toEqual({
      type: "bar_shift",
      source: {
        name: "fastSMA",
        type: "variable_ref",
      },
      shiftBar: {
        type: "constant",
        value: 0,
      },
      fallback: {
        type: "constant",
        value: 0,
      },
    });
  });

  it("SMAインジケーターが IRIndicatorDefinition に正しく変換されていることを確認する", () => {
    // IRProgram 内のインジケーターインスタンスリストを取得
    expect(irProgram.indicatorDefs).toBeDefined();
    const indicatorsDefinitionList = irProgram.indicatorDefs;
    expect(indicatorsDefinitionList.length).toBe(1);

    const irIndicator = indicatorsDefinitionList[0] as IRIndicatorDefinition;
    // インジケーター名が "SMA" であること
    expect(irIndicator.name).toBe(MA.name);
    // パラメータに period: 5 が含まれていること
    expect(irIndicator.params).toBeDefined();
    // エクスポート変数 (exportVars) に戦略内変数名が含まれていること（fastSMA）
    expect(irIndicator.exportVars).toBeDefined();
    expect(
      Array.isArray(irIndicator.exportVars)
        ? irIndicator.exportVars
        : Object.values(irIndicator.exportVars)
    ).toContain("ma");
    expect(irIndicator.usedAggregations).toContain("sma");
  });

  it("SMAインジケーターが IRIndicatorInstance に正しく変換されていることを確認する", () => {
    // IRProgram 内のインジケーターインスタンスリストを取得
    expect(irProgram.strategy.indicators).toBeDefined();
    const indicatorInstanceList = irProgram.strategy.indicators;
    expect(indicatorInstanceList.length).toBe(1);

    const irIndicator = indicatorInstanceList[0] as IRIndicatorInstance;
    // インジケーターのIDが定義されていること
    expect(irIndicator.id).toBeDefined();
    // インジケーター名が "SMA" であること
    expect(irIndicator.name).toBe(MA.name);
    // パラメータに period: 5 が含まれていること
    expect(irIndicator.params).toBeDefined();
    expect(
      irIndicator.params.map((p) => p.value).filter((p) => p.type === "constant" && p.value === 5)
        .length
    ).toBe(1);
  });

  it("sma 集約が正しく変換されていることを確認する", () => {
    expect(irProgram.aggregations).toBeDefined();
    const aggregations = irProgram.aggregations;
    expect(aggregations.length).toBe(4);
    expect(aggregations[0]).toBe("sma");
  });
});
