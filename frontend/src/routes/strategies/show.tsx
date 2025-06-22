import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStrategy, StrategyDetail } from "../../api/strategies";
import StrategyDetailView from "../../features/strategies/StrategyDetail";

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
      <StrategyDetailView strategy={strategy} />
    </div>
  );
};

export default StrategyDetails;
