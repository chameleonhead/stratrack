import { createContext, useContext } from "react";
import { VariableDefinition } from "../types";

// Context定義
export const VariableContext = createContext<VariableDefinition[]>([]);

// フックで利用できるようにする
export const useVariables = () => useContext(VariableContext);
