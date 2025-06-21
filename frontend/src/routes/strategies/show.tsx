import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStrategy, StrategyDetail } from "../../api/strategies";

const StrategyDetails = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const [strategy, setStrategy] = useState<StrategyDetail | null>(null);

  useEffect(() => {
    if (strategyId) {
      getStrategy(strategyId)
        .then(setStrategy)
        .catch((err) => console.error(err));
    }
  }, [strategyId]);

  if (!strategy) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{strategy.name}</h2>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-2">説明</h3>
        <p className="whitespace-pre-wrap">{strategy.description ?? "(なし)"}</p>
      </section>
    </div>
  );
};

export default StrategyDetails;
