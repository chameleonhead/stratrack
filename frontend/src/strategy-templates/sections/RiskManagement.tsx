import { useLocalValue } from "../../hooks/useLocalValue";
import Select from "../../components/Select";
import NumberInput from "../../components/NumberInput";
import { StrategyTemplate } from "../../dsl/strategy";

export type RiskManagementProps = {
  value?: Partial<StrategyTemplate>;
  onChange?: (value: Partial<StrategyTemplate>) => void;
};

function RiskManagement({ value, onChange }: RiskManagementProps) {
  const [localValue, setLocalValue] = useLocalValue({ exit: [] }, value, onChange);
  return (
    <section id="risk-management" className="space-y-4">
      <h2>リスク・ロット管理</h2>
      <Select
        fullWidth
        label="ロットタイプ"
        value={localValue.riskManagement?.type}
        onChange={(value) => {
          setLocalValue({
            ...localValue,
            riskManagement:
              value === "fixed"
                ? { type: "fixed", lotSize: 0 }
                : { type: "percentage", percent: 0 },
          });
        }}
        options={[
          { value: "fixed", label: "ロット値" },
          { value: "percentage", label: "口座資金に対する割合(%)" },
        ]}
        allowEmpty
      />
      <NumberInput
        fullWidth
        label={localValue.riskManagement?.type === "fixed" ? "ロット値" : "割合"}
        value={
          (localValue.riskManagement?.type === "fixed"
            ? localValue.riskManagement?.lotSize
            : localValue.riskManagement?.percent) || 0
        }
        onChange={(value) => {
          setLocalValue({
            ...localValue,
            riskManagement:
              localValue.riskManagement?.type === "fixed"
                ? { type: "fixed", lotSize: value || 0 }
                : { type: "percentage", percent: value || 0 },
          });
        }}
      />
    </section>
  );
}

export default RiskManagement;
