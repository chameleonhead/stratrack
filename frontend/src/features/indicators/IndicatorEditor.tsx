import { useEffect } from "react";
import { Indicator } from "../../codegen/dsl/indicator";
import { renderIndicatorMql } from "../../codegen/generators/indicatorCodeRenderer";
import { indicatorEngine } from "../../services/indicatorEngine";

export type IndicatorEditorProps = {
  value?: Partial<Indicator>;
  onChange?: (value: Partial<Indicator>) => void;
};

function IndicatorEditor({ value }: IndicatorEditorProps) {
  useEffect(() => {
    if (!value?.name || !value.template) return;
    const src = renderIndicatorMql(value as Indicator);
    indicatorEngine.set(value.name, src);
  }, [value]);
  return null;
}

export default IndicatorEditor;
