import { useState } from "react";
import EntryLogic from "./sections/EntryLogic";
import PositionManagement from "./sections/PositionManagement";
import Variables from "./sections/Variables";
import ExitLogic from "./sections/ExitLogic";
import RiskManagement from "./sections/RiskManagement";
import FilterConditions from "./sections/FilterConditions";
import TimingControl from "./sections/TimingControl";
import MultiPosition from "./sections/MultiPosition";
import VariableProvider from "./components/VariableProvider";
import { StrategyTemplate } from "./types";

export type StrategyTemplateEditorProps = {
  value: Partial<StrategyTemplate>;
  onChange: (value: Partial<StrategyTemplate>) => void;
};

function StrategyTemplateEditor() {
  const [template, setTemplate] = useState<Partial<StrategyTemplate>>({
    variables: [],
    entry: [],
    exit: [],
  });
  return (
    <VariableProvider variables={template.variables || []}>
      {/* 変数設定 */}
      <Variables value={template} onChange={setTemplate} />

      {/* エントリー戦略 */}
      <EntryLogic value={template} onChange={setTemplate} />

      {/* イグジット戦略 */}
      <ExitLogic value={template} onChange={setTemplate} />

      {/* 保有中戦略 */}
      <PositionManagement value={template} onChange={setTemplate} />

      {/* リスク・ロット戦略 */}
      <RiskManagement value={template} onChange={setTemplate} />

      {/* フィルター条件 */}
      <FilterConditions value={template} onChange={setTemplate} />

      {/* タイミング制御 */}
      <TimingControl value={template} onChange={setTemplate} />

      {/* ⑧ 複数ポジション戦略 */}
      <MultiPosition value={template} onChange={setTemplate} />

      {/* ⑨ 保存・コード確認 */}
      <section id="save-and-preview">
        <h2>コードと保存</h2>
        {/* <CodePreview name="generated_code" />
      <Button type="submit">保存</Button> */}
      </section>
    </VariableProvider>
  );
}

export default StrategyTemplateEditor;
