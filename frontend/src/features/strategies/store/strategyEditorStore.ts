import { create } from "zustand";
import { Strategy, StrategyTemplate } from "../../../codegen/dsl/strategy";

export const DEFAULT_TEMPLATE: StrategyTemplate = {
  variables: [],
  entry: [],
  exit: [],
  riskManagement: { type: "percentage", percent: 100 },
};

export interface StrategyEditorState {
  value: Partial<Strategy>;
  setValue: (value: Partial<Strategy>) => void;
  update: (changes: Partial<Strategy>) => void;
}

export function createStrategyEditorStore(initial?: Partial<Strategy>) {
  return create<StrategyEditorState>((set) => ({
    value: initial ?? ({ template: DEFAULT_TEMPLATE } as Partial<Strategy>),
    setValue: (value) => set({ value }),
    update: (changes) => set((state) => ({ value: { ...state.value, ...changes } })),
  }));
}
