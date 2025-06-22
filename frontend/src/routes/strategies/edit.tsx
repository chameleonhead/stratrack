import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStrategy, updateStrategy } from "../../api/strategies";
import StrategyEditor from "../../features/strategies/StrategyEditor";
import { Strategy, StrategyTemplate } from "../../codegen/dsl/strategy";
import { renderStrategyCode } from "../../codegen/generators/strategyCodeRenderer";
import { useIndicatorList } from "../../features/indicators/IndicatorProvider";

const EditStrategy = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const [strategy, setStrategy] = useState<Partial<Strategy> | null>(null);
  const indicators = useIndicatorList();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (strategyId) {
      getStrategy(strategyId)
        .then((s) => setStrategy(s as unknown as Partial<Strategy>))
        .catch((err) => console.error(err));
    }
  }, [strategyId]);

  if (!strategy) {
    return <p className="p-6">Loading...</p>;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!strategyId || !strategy.name || !strategy.template) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const generatedCode = renderStrategyCode(
      "python",
      strategy.template as StrategyTemplate,
      indicators
    );
    try {
      await updateStrategy(strategyId, {
        name: strategy.name,
        description: strategy.description,
        tags: strategy.tags,
        template: strategy.template as Record<string, unknown>,
        generatedCode,
      });
      navigate(`/strategies/${strategyId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">戦略編集</h2>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">戦略の詳細を編集してください</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-error">{error}</p>}
          <StrategyEditor value={strategy} onChange={setStrategy} />
          <button
            type="submit"
            className="mt-4 bg-primary text-primary-content py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            更新
          </button>
        </form>
      </section>
    </div>
  );
};

export default EditStrategy;
