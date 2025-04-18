import { useMemo } from "react";
import ConditionBuilder from "../components/ConditionsBuilder";
import { useLocalValue } from "../../hooks/useLocalValue";
import { StrategyTemplate } from "../../codegen/dsl/strategy";
import { Condition } from "../../codegen/dsl/common";

export type ExitLogicProps = {
  value?: Partial<StrategyTemplate>;
  onChange?: (value: Partial<StrategyTemplate>) => void;
};

function ExitLogic({ value, onChange }: ExitLogicProps) {
  const [localValue, setLocalValue] = useLocalValue({ exit: [] }, value, onChange);
  const longEntries = useMemo(
    () => localValue.exit?.filter((e) => e.type === "long") || [],
    [localValue.exit]
  );
  const shortEntries = useMemo(
    () => localValue.exit?.filter((e) => e.type === "short") || [],
    [localValue.exit]
  );
  const handleLongConditionChange = (conditions: Partial<Condition>[]) => {
    const longEntries = conditions.map((condition) => ({
      type: "long" as const,
      condition: condition as Condition,
    }));
    setLocalValue({ ...localValue, exit: [...shortEntries, ...longEntries] });
  };
  const handleShortConditionChange = (conditions: Partial<Condition>[]) => {
    const shortEntries = conditions.map((condition) => ({
      type: "short" as const,
      condition: condition as Condition,
    }));
    setLocalValue({ ...localValue, exit: [...shortEntries, ...longEntries] });
  };
  return (
    <section id="exit-logic" className="space-y-4">
      <div>
        <h2>イグジット条件</h2>
        <p className="text-gray-500 text-sm">
          イグジット条件は、ポジションをイグジットするための条件を定義します。複数の条件を組み合わせて設定できます。
        </p>
      </div>
      <div>
        <h3>買い条件</h3>
        <ConditionBuilder
          value={longEntries.map((exit) => exit.condition)}
          onChange={handleLongConditionChange}
        />
      </div>
      <div>
        <h3>売り条件</h3>
        <ConditionBuilder
          value={shortEntries.map((exit) => exit.condition)}
          onChange={handleShortConditionChange}
        />
      </div>
    </section>
  );
}

export default ExitLogic;
