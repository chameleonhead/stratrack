import { useCallback, useMemo } from "react";
import ConditionBuilder from "../components/StrategyConditionsBuilder";
import { useLocalValue } from "../../../hooks/useLocalValue";
import { StrategyCondition, StrategyTemplate } from "../../../codegen/dsl/strategy";

export type EntryLogicProps = {
  value?: Partial<StrategyTemplate>;
  onChange?: (value: Partial<StrategyTemplate>) => void;
};

function EntryLogic({ value, onChange }: EntryLogicProps) {
  const [localValue, setLocalValue] = useLocalValue({ entry: [] }, value, onChange);
  const longEntries = useMemo(
    () => localValue.entry?.filter((e) => e.type === "long") || [],
    [localValue.entry]
  );
  const shortEntries = useMemo(
    () => localValue.entry?.filter((e) => e.type === "short") || [],
    [localValue.entry]
  );
  const handleLongConditionChange = useCallback(
    (conditions: Partial<StrategyCondition>[]) => {
      setLocalValue((localValue) => {
        const shortEntries = localValue.entry?.filter((e) => e.type === "short") || [];
        const longEntries = conditions.map((condition) => ({
          type: "long" as const,
          condition: condition as StrategyCondition,
        }));
        return { ...localValue, entry: [...shortEntries, ...longEntries] };
      });
    },
    [setLocalValue]
  );
  const handleShortConditionChange = useCallback(
    (conditions: Partial<StrategyCondition>[]) => {
      setLocalValue((localValue) => {
        const longEntries = localValue.entry?.filter((e) => e.type === "long") || [];
        const shortEntries = conditions.map((condition) => ({
          type: "short" as const,
          condition: condition as StrategyCondition,
        }));
        return { ...localValue, entry: [...shortEntries, ...longEntries] };
      });
    },
    [setLocalValue]
  );
  return (
    <section id="entry-logic" className="space-y-4">
      <div>
        <h2>エントリー条件</h2>
        <p className="text-gray-500 text-sm">
          エントリー条件は、戦略がエントリーするための条件を定義します。複数の条件を組み合わせて設定できます。
        </p>
      </div>
      <div>
        <h3>買い条件</h3>
        <ConditionBuilder
          value={longEntries.map((entry) => entry.condition)}
          onChange={handleLongConditionChange}
        />
      </div>
      <div>
        <h3>売り条件</h3>
        <ConditionBuilder
          value={shortEntries.map((entry) => entry.condition)}
          onChange={handleShortConditionChange}
        />
      </div>
    </section>
  );
}

export default EntryLogic;
