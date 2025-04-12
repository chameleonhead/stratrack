import Checkbox from "../../components/Checkbox";
import NumberInput from "../../components/NumberInput";
import { useLocalValue } from "../../hooks/useLocalValue";
import { StrategyTemplate } from "../types";

export type MultiPositionProps = {
  value?: Partial<StrategyTemplate>;
  onChange?: (value: Partial<StrategyTemplate>) => void;
};

function MultiPosition({ value, onChange }: MultiPositionProps) {
  const [localValue, setLocalValue] = useLocalValue({ multiPositionControl: {} }, value, onChange);
  return (
    <section id="multi-position" className="space-y-4">
      <h2>複数ポジションの制御</h2>
      <NumberInput
        fullWidth
        label="最大ポジション数"
        value={localValue.multiPositionControl?.maxPositions || 1}
        onChange={(value) => {
          setLocalValue({
            ...localValue,
            multiPositionControl: {
              ...(localValue.multiPositionControl || {}),
              maxPositions: value || 1,
            },
          });
        }}
      />
      <Checkbox
        label="複数通貨の同時取引を許可"
        checked={localValue.multiPositionControl?.allowHedging || false}
        onChange={(checked) => {
          setLocalValue({
            ...localValue,
            multiPositionControl: {
              ...(localValue.multiPositionControl || {}),
              allowHedging: checked,
            },
          });
        }}
      />
    </section>
  );
}

export default MultiPosition;
