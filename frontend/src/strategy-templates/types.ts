// 戦略テンプレートの型定義
export type StrategyTemplate = {
  /** エントリー条件: エントリーのトリガーとなる条件 */
  entry: Condition;
  /** イグジット条件: 手仕舞い（決済）の条件 */
  exit: Condition;
  /** 保有中戦略: トレールストップ、利確、損切り、ナンピン等の設定 */
  positionManagement?: PositionManagement;
  /** リスク・ロット戦略: ロットサイズ計算方法（固定値 or 口座割合） */
  riskLotStrategy?: RiskLotStrategy;
  /** 環境フィルター: 相場の環境条件（トレンド/ボラ判断、ニュース回避） */
  environmentFilter?: EnvironmentFilter;
  /** タイミング制御: 売買を行う曜日や時間帯の制限 */
  timingControl?: TimingControl;
  /** 複数ポジション制御: 同時保有ポジション数やヘッジ可否の設定 */
  multiPositionControl?: MultiPositionControl;
}

// 条件式で使用するオペランドの型定義
export type Operand = PriceOperand | IndicatorOperand | NumberOperand;

/** 現在の価格や特定の足の価格を表すオペランド */
export type PriceOperand = {
  type: 'price';
  source?: 'bid' | 'ask' | 'close' | 'open' | 'high' | 'low';
  /** オプション: 過去の価格にオフセットするバー数（0は現在のバー） */
  shiftBars?: number;
}

/** テクニカル指標の値を表すオペランド */
export type IndicatorOperand = {
  type: 'indicator';
  /** 指標の名称（例: 'SMA', 'RSI' 等） */
  name: string;
  /** 指標に渡すパラメータ（期間など）、キーと値の辞書 */
  params?: { [key: string]: string | number | boolean | null };
  /** オプション: 指標を計算する価格の種類（終値など） */
  source?: 'close' | 'open' | 'high' | 'low';
}

/** 定数数値を表すオペランド */
export type NumberOperand = {
  type: 'number';
  value: number;
}

/** 比較条件: leftとrightを演算子operatorで比較 */
export type ComparisonCondition = {
  type: 'comparison';
  left: Operand;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  right: Operand;
}

/** クロス条件: leftがrightを上抜け(cross_over)または下抜け(cross_under)した */
export type CrossCondition = {
  type: 'cross';
  direction: 'cross_over' | 'cross_under';
  left: Operand;
  right: Operand;
}

/** 状態条件: operandが上昇傾向(rising)または下降傾向(falling)である */
export type StateCondition = {
  type: 'state';
  operand: Operand;
  state: 'rising' | 'falling';
  /** オプション: 直近で連続して上昇/下降している期間やバー数等 */
  length?: number;
}

/** 変化条件: 指定したconditionが直前からtrue/falseの状態遷移をした */
export type ChangeCondition = {
  type: 'change';
  condition: Condition;
  change: 'to_true' | 'to_false';
}

/** グループ条件: 複数のconditionをand/orで組み合わせた複合条件 */
export type GroupCondition = {
  type: 'group';
  operator: 'and' | 'or';
  conditions: Condition[];
}

/** Condition型: 上記5種類のいずれかの条件 */
export type Condition =
  | ComparisonCondition
  | CrossCondition
  | StateCondition
  | ChangeCondition
  | GroupCondition;

/** 保有中戦略: トレールストップ・利確・損切り・ナンピン等の設定 */
export type PositionManagement = {
  /** トレールストップ設定: 一定の利益幅が出たらストップ位置を引き上げる */
  trailingStop?: {
    enabled: boolean;
    /** トレール幅（例: 何pips離れた位置にストップを置くか） */
    distance: number;
  };
  /** 利益確定設定: 利益ターゲットに達したら決済する */
  takeProfit?: {
    enabled: boolean;
    /** 利確ポイント（例: 目標とする利益幅pips、または価格レベル） */
    target: number;
  };
  /** 損切り設定: 損失許容幅に達したら決済する */
  stopLoss?: {
    enabled: boolean;
    /** 損切り幅（例: 許容する損失pips、または価格差） */
    limit: number;
  };
  /** ナンピン（平均建玉）設定: 含み損時にポジションを追加する条件 */
  averagingDown?: {
    enabled: boolean;
    /** 最大で何回ナンピンするか（追加ポジション数） */
    maxAdds: number;
    /** ナンピンする価格間隔（例: 価格が何pips不利に動いたら追加するか） */
    addDistance: number;
  };
}

/** リスク・ロット戦略: エントリー時のロットサイズ計算方法 */
export type RiskLotStrategy =
  | { type: 'fixed';    /** 固定ロット数 */ lotSize: number }
  | { type: 'percentage'; /** 口座資金に対する割合(%) */ percent: number };

/** 環境フィルター: 市場環境による取引条件制限 */
export type EnvironmentFilter = {
  /** トレンドフィルター条件: トレンド方向を判定するCondition */
  trendCondition?: Condition;
  /** ボラティリティフィルター条件: ボラが一定水準以上/以下か判定するCondition */
  volatilityCondition?: Condition;
  /** ニュース回避フラグ: 重要ニュース時の取引を避ける場合true */
  avoidNews?: boolean;
}

/** タイミング制御: 売買を許可する曜日・時間帯の指定 */
export type TimingControl = {
  /** 許可する曜日（0=日曜, 1=月曜,... 6=土曜 の配列） */
  allowedDays?: number[];
  /** 許可する時間帯レンジ（24時間表記）。複数指定可 */
  allowedTimeRanges?: Array<{
    /** 開始時刻 (例: "09:30") */
    from: string;
    /** 終了時刻 (例: "15:30") */
    to: string;
  }>;
}

/** 複数ポジション制御: ポジション数やヘッジ許可設定 */
export type MultiPositionControl = {
  /** 同時に保有可能な最大ポジション数 */
  maxPositions?: number;
  /** 買いと売りのヘッジポジションを同時保有することを許可するか */
  allowHedging?: boolean;
}
