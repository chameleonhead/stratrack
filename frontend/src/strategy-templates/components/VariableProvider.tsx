import { VariableDefinition } from "../types";
import { VariableContext } from "./useVariables";

// Providerコンポーネント
export const VariableProvider = ({
  variables,
  children,
}: {
  variables: VariableDefinition[];
  children: React.ReactNode;
}) => {
  return (
    <VariableContext.Provider value={variables}>
      {children}
    </VariableContext.Provider>
  );
};
