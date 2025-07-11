import { createContext, useContext } from "react";
import { StrategyVariableDefinition } from "../../../codegen/dsl/strategy";

// Context定義
export const VariableContext = createContext<StrategyVariableDefinition[]>([]);

// フックで利用できるようにする
export const useVariables = () => useContext(VariableContext);
