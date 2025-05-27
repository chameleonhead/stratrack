import {
  AggregationExpression,
  BarShiftExpression,
  Condition,
  ConstantExpression,
  IndicatorExpression,
  ParamReferenceExpression,
  PriceExpression,
  ScalarExpression,
  ScalarPriceExpression,
  SourceExpression,
  VariableReferenceExpression,
} from "./common";

export type Strategy = {
  /** 戦略ID */
  id: string;
  /** 戦略名 */
  name: string;
  /** 戦略名（英語） */
  nameEn: string;
  /** 戦略の説明 */
  description?: string;
  /** タグ */
  tags?: string[];
  /** 戦略のバージョン */
  version?: string;
  /** 戦略の作成日時 */
  createdAt?: string;
  /** 戦略の更新日時 */
  updatedAt?: string;
  /** 戦略テンプレートの内容 */
  template: StrategyTemplate;
};

// 戦略テンプレートの型定義
export type StrategyTemplate = {
  /** 変数の宣言 */
  variables?: StrategyVariableDefinition[];
  /** エントリー条件: エントリーのトリガーとなる条件 */
  entry: EntryCondition[];
  /** イグジット条件: 手仕舞い（決済）の条件 */
  exit: ExitCondition[];
  /** リスク・ロット戦略: ロットサイズ計算方法（固定値 or 口座割合） */
  riskManagement: RiskManagement;
  /** 保有中戦略: トレールストップ、利確、損切り、ナンピン等の設定 */
  positionManagement?: PositionManagement;
  /** 環境フィルター: 相場の環境条件（トレンド/ボラ判断、ニュース回避） */
  environmentFilter?: EnvironmentFilter;
  /** タイミング制御: 売買を行う曜日や時間帯の制限 */
  timingControl?: TimingControl;
  /** 複数ポジション制御: 同時保有ポジション数やヘッジ可否の設定 */
  multiPositionControl?: MultiPositionControl;
};

// 変数定義: 変数名とその値を表す型定義
export type StrategyVariableDefinition = {
  name: string; // 変数名（例: rsi_avg）
  expression: StrategyVariableExpression; // RSIやMACDなどの指標オペランド（再帰可能）
  invalidPeriod?: ScalarExpression;
  fallback?: ScalarExpression;
  description?: string;
};

// 変数式の型定義を再帰的な型から分離する
export type StrategyVariableExpression = Exclude<
  ScalarExpression,
  | ParamReferenceExpression
  | SourceExpression
  | AggregationExpression
  | Extract<PriceExpression, { valueType: "array" }>
>;

export type StrategyCondition = Condition<
  ConstantExpression | ScalarPriceExpression | BarShiftExpression | IndicatorExpression,
  VariableReferenceExpression | PriceExpression
>;

// エントリー条件: エントリーのトリガーとなる条件
export type EntryCondition = {
  /** エントリー条件のタイプ */
  type: "long" | "short";
  /** エントリー条件のトリガーとなる条件 */
  condition: StrategyCondition;
};

// イグジット条件: 手仕舞い（決済）の条件
export type ExitCondition = {
  /** イグジット条件のタイプ */
  type: "long" | "short";
  /** イグジット条件のトリガーとなる条件 */
  condition: StrategyCondition;
};

/** 保有中戦略: トレールストップ・利確・損切り・ナンピン等の設定 */
export type PositionManagement = {
  /** トレールストップ設定: 一定の利益幅が出たらストップ位置を引き上げる */
  trailingStop?: {
    enabled: boolean;
    /** トレール幅（例: 何pips離れた位置にストップを置くか） */
    distance: number | null;
  };
  /** 利益確定設定: 利益ターゲットに達したら決済する */
  takeProfit?: {
    enabled: boolean;
    /** 利確ポイント（例: 目標とする利益幅pips、または価格レベル） */
    target: number | null;
  };
  /** 損切り設定: 損失許容幅に達したら決済する */
  stopLoss?: {
    enabled: boolean;
    /** 損切り幅（例: 許容する損失pips、または価格差） */
    limit: number | null;
  };
};

/** リスク・ロット戦略: エントリー時のロットサイズ計算方法 */
export type RiskManagement =
  | { type: "fixed"; /** 固定ロット数 */ lotSize: number }
  | { type: "percentage"; /** 口座資金に対する割合(%) */ percent: number };

/** 環境フィルター: 市場環境による取引条件制限 */
export type EnvironmentFilter = {
  /** トレンドフィルター条件: トレンド方向を判定するCondition */
  trendCondition?: boolean;
  /** ボラティリティフィルター条件: ボラが一定水準以上/以下か判定するCondition */
  volatilityCondition?: boolean;
  /** ニュース回避フラグ: 重要ニュース時の取引を避ける場合true */
  avoidNews?: boolean;
};

export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type DayAndTimeRange = {
  /** 許可する曜日（0=日曜, 1=月曜,... 6=土曜） */
  day: Weekday;
  /** 許可する時間帯レンジ（UTC・24時間表記）。複数指定可 */
  timeRange: {
    /** 開始時刻 (例: "09:30") */
    from: string;
    /** 終了時刻 (例: "15:30") */
    to: string;
  };
};

/** タイミング制御: 売買を許可する曜日・時間帯の指定 */
export type TimingControl = {
  /** 許可するタイミング */
  allowedTradingPeriods?: DayAndTimeRange[];
  /** 許可されていない時間の前にポジションはすべて手放す */
  forceCloseBeforeDisallowed?: boolean;
  /** 許可されていない時間でも手仕舞いはできるようにする */
  allowExitDuringDisallowed?: boolean;
};

/** 複数ポジション制御: ポジション数やヘッジ許可設定 */
export type MultiPositionControl = {
  /** 同時に保有可能な最大ポジション数 */
  maxPositions?: number;
  /** 買いと売りのヘッジポジションを同時保有することを許可するか */
  allowHedging?: boolean;
};
