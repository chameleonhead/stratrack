import NumberInput from "../../components/NumberInput";
import { useLocalValue } from "../../hooks/useLocalValue";
import { StrategyTemplate } from "../types";

export type PositionManagementProps = {
  value?: Partial<StrategyTemplate>;
  onChange?: (value: Partial<StrategyTemplate>) => void;
};

function PositionManagement({ value, onChange }: PositionManagementProps) {
  const [localValue, setLocalValue] = useLocalValue({ positionManagement: {} }, value, onChange);
  return (
    <section id="position-management" className="space-y-4">
      <h2>保有中戦略</h2>
      <NumberInput
        fullWidth
        label="テイクプロフィット（pips）"
        value={localValue?.positionManagement?.takeProfit?.target || null}
        onChange={(newvalue) =>
          setLocalValue({
            ...localValue,
            positionManagement: {
              ...(localValue.positionManagement || {}),
              takeProfit: { enabled: !!newvalue, target: newvalue },
            },
          })
        }
      />
      <NumberInput
        fullWidth
        label="ストップロス（pips）"
        value={localValue?.positionManagement?.stopLoss?.limit || null}
        onChange={(newvalue) =>
          setLocalValue({
            ...localValue,
            positionManagement: {
              ...(localValue.positionManagement || {}),
              stopLoss: { enabled: !!newvalue, limit: newvalue },
            },
          })
        }
      />
      <NumberInput
        fullWidth
        label="トレーリングストップ（pips）"
        value={localValue?.positionManagement?.trailingStop?.distance || null}
        onChange={(newvalue) =>
          setLocalValue({
            ...localValue,
            positionManagement: {
              ...(localValue.positionManagement || {}),
              trailingStop: { enabled: !!newvalue, distance: newvalue },
            },
          })
        }
      />
    </section>
  );
}

export default PositionManagement;
