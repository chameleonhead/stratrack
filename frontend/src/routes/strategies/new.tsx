import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStrategy } from "../../api/strategies";
import StrategyEditor from "../../features/strategies/StrategyEditor";
import { Strategy, StrategyTemplate } from "../../codegen/dsl/strategy";
import { renderStrategyCode } from "../../codegen/generators/strategyCodeRenderer";
import { useIndicatorList } from "../../features/indicators/IndicatorProvider";

const DEFAULT_TEMPLATE: StrategyTemplate = {
  variables: [],
  entry: [],
  exit: [],
  riskManagement: { type: "percentage", percent: 100 },
};

const NewStrategy = () => {
  const navigate = useNavigate();
  const indicators = useIndicatorList();
  const [strategy, setStrategy] = useState<Partial<Strategy>>({ template: DEFAULT_TEMPLATE });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!strategy.name || !strategy.template) {
      return;
    }
    const generatedCode = renderStrategyCode(
      "python",
      strategy.template as StrategyTemplate,
      indicators
    );
    await createStrategy({
      name: strategy.name,
      description: strategy.description,
      tags: strategy.tags,
      template: strategy.template as Record<string, unknown>,
      generatedCode,
    });
    navigate("/strategies");
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">戦略新規作成</h2>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">戦略の詳細を入力してください</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <StrategyEditor value={strategy} onChange={setStrategy} />
          <button type="submit" className="mt-4 bg-primary text-primary-content py-2 px-4 rounded">
            作成
          </button>
        </form>
      </section>
    </div>
  );
};

export default NewStrategy;
