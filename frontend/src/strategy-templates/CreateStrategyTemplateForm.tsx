import Checkbox from "../components/Checkbox";
import NumberInput from "../components/NumberInput";
import Select from "../components/Select";
import TimeRangePicker from "../components/TimeRangePicker";
import WeekdaySelector from "../components/WeekdaySelector";
import BasicInfo from "./sections/BasicInfo";
import EntryLogic from "./sections/EntryLogic";
import PositionManagement from "./sections/PositionManagement";
import Variables from "./sections/Variables";

function CreateStrategyTemplateForm() {
  return (
    <form>
      {/* 基本情報 */}
      <BasicInfo />

      {/* 変数設定 */}
      <Variables />

      {/* エントリー戦略 */}
      <EntryLogic />

      {/* 保有中戦略 */}
      <PositionManagement />

      {/* イグジット戦略 */}
      <section id="exit-logic">
        <h2>イグジット条件</h2>
        {/* <ConditionBuilder name="exit.condition" /> */}
        <Select
          label="アクション"
          name="exit.action"
          options={["close", "reverse"]}
        />
      </section>

      {/* リスク・ロット戦略 */}
      <section id="risk-management">
        <h2>リスク・ロット管理</h2>
        <Select
          label="ロットタイプ"
          name="risk.lot_type"
          options={["fixed", "percent_of_balance"]}
        />
        <NumberInput label="ロット値 or 割合" name="risk.lot_value" />
      </section>

      {/* フィルター条件 */}
      <section id="filter-conditions">
        <h2>環境フィルター</h2>
        <Checkbox label="トレンド時のみ" name="filter.trend" />
        <Checkbox
          label="ボラティリティが高いときのみ"
          name="filter.volatility"
        />
        <Checkbox
          label="指標発表前はエントリーしない"
          name="filter.avoid_news"
        />
      </section>

      {/* タイミング制御 */}
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
