import { useMemo } from "react";
import { VariableDefinition } from "../types";
import { VariableContext } from "./useVariables";

// Providerコンポーネント
function VariableProvider({
  variables,
  children,
}: {
  variables: VariableDefinition[];
  children: React.ReactNode;
}) {
  return (
    <VariableContext.Provider value={useMemo(() => variables.filter((e) => !!e.name), [variables])}>
      {children}
    </VariableContext.Provider>
  );
}

export default VariableProvider;
