import Checkbox from "../../../components/Checkbox";
import { StrategyTemplate } from "../../../codegen/dsl/strategy";
import { useLocalValue } from "../../../hooks/useLocalValue";

export type FilterConditionsProps = {
  value?: Partial<StrategyTemplate>;
  onChange?: (value: Partial<StrategyTemplate>) => void;
};

function FilterConditions({ value, onChange }: FilterConditionsProps) {
  const [localValue, setLocalValue] = useLocalValue({ environmentFilter: {} }, value, onChange);
  return (
    <section id="filter-conditions" className="space-y-4">
      <h2>環境フィルター</h2>
      <Checkbox
        label="トレンド時のみ"
        checked={localValue.environmentFilter?.trendCondition || false}
        onChange={(checked) => {
          setLocalValue({
            ...localValue,
            environmentFilter: {
              ...(localValue.environmentFilter || {}),
              trendCondition: checked,
            },
          });
        }}
      />
      <Checkbox label="ボラティリティが高いときのみ" name="filter.volatility" />
      <Checkbox label="指標発表前はエントリーしない" name="filter.avoid_news" />
    </section>
  );
}

export default FilterConditions;
