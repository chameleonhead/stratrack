import Checkbox from "../components/Checkbox";
import Input from "../components/Input";
import NumberInput from "../components/NumberInput";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import TimeRangePicker from "../components/TimeRangePicker";
import WeekdaySelector from "../components/WeekdaySelector";

function CreateStrategyTemplateForm() {
  return (
    <form>
      {/* ① 基本情報 */}
      <section id="basic-info">
        <h2>基本情報</h2>
        <Input label="戦略名" name="name" required />
        <Textarea label="説明" name="description" rows={3} />
        <Select label="通貨ペア" name="symbol" options={["USDJPY", "EURUSD"]} />
        <Select
          label="時間足"
          name="timeframe"
          options={["1m", "5m", "15m", "1h", "4h", "1d"]}
        />
      </section>

      {/* ② エントリー戦略 */}
      <section id="entry-logic">
        <h2>エントリー条件</h2>
        <Select
          label="インジケーター"
          name="entry.indicator"
          options={["Donchian Channel", "SMA", "RSI"]}
        />
        <NumberInput label="期間" name="entry.period" defaultValue={20} />
        {/* <ConditionBuilder name="entry.condition" /> */}
        <Select
          label="エントリー方向"
          name="entry.direction"
          options={["buy", "sell", "both"]}
        />
      </section>

      {/* ③ 保有中戦略 */}
      <section id="position-management">
        <h2>保有中戦略</h2>
        <NumberInput label="テイクプロフィット（%）" name="position.tp" />
        <NumberInput label="ストップロス（%）" name="position.sl" />
        <Checkbox label="中央値で決済" name="position.midline_exit" />
        <NumberInput
          label="トレーリングストップ（pips）"
          name="position.trailing_stop"
        />
      </section>

      {/* ④ イグジット戦略 */}
      <section id="exit-logic">
        <h2>イグジット条件</h2>
        {/* <ConditionBuilder name="exit.condition" /> */}
        <Select
          label="アクション"
          name="exit.action"
          options={["close", "reverse"]}
        />
      </section>

      {/* ⑤ リスク・ロット戦略 */}
      <section id="risk-management">
        <h2>リスク・ロット管理</h2>
        <Select
          label="ロットタイプ"
          name="risk.lot_type"
          options={["fixed", "percent_of_balance"]}
        />
        <NumberInput label="ロット値 or 割合" name="risk.lot_value" />
      </section>

      {/* ⑥ フィルター条件 */}
      <section id="filter-conditions">
        <h2>環境フィルター</h2>
        <Checkbox label="トレンド時のみ" name="filter.trend" />
        <Checkbox label="ボラティリティが高いときのみ" name="filter.volatility" />
        <Checkbox label="指標発表前はエントリーしない" name="filter.avoid_news" />
      </section>

      {/* ⑦ タイミング制御 */}
      <section id="timing-control">
        <h2>時間帯・曜日制限</h2>
        <TimeRangePicker label="取引可能時間帯" name="timing.allowed_hours" />
        <WeekdaySelector label="取引可能曜日" name="timing.days" />
      </section>

      {/* ⑧ 複数ポジション戦略 */}
      <section id="multi-position">
        <h2>複数ポジションの制御</h2>
        <NumberInput
          label="最大ポジション数"
          name="multi_position.max_positions"
        />
        {/* <Checkbox label="複数通貨の同時取引を許可" name="multi_position.allow_hedging" /> */}
      </section>

      {/* ⑨ 保存・コード確認 */}
      <section id="save-and-preview">
        <h2>コードと保存</h2>
        {/* <CodePreview name="generated_code" />
      <Button type="submit">保存</Button> */}
      </section>
    </form>
  );
}

export default CreateStrategyTemplateForm;
