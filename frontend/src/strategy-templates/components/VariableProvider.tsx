import { useMemo } from "react";
import { VariableContext } from "./useVariables";
import { StrategyVariableDefinition } from "../../dsl/strategy";

// Providerコンポーネント
function VariableProvider({
  variables,
  children,
}: {
  variables: StrategyVariableDefinition[];
  children: React.ReactNode;
}) {
  return (
    <VariableContext.Provider value={useMemo(() => variables.filter((e) => !!e.name), [variables])}>
      {children}
    </VariableContext.Provider>
  );
}

export default VariableProvider;
