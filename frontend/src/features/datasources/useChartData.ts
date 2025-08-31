import { createContext, useContext } from "react";
import { Candle, Indicator } from "../../components/CandlestickChart";
import type { IndicatorDefinition } from "../../services/indicatorEngine";

export type Range = { from: number; to: number };
export type ChartDataContextValue = {
  candleData: Candle[];
  range: Range | null;
  dsRange: Range | null;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  isLoading: boolean;
  error: string | null;
  handleRangeChange: (range: Range) => Promise<void>;
  symbol: string;
  indicators: Indicator[];
  setIndicators: React.Dispatch<React.SetStateAction<Indicator[]>>;
  setIndicatorDefs: React.Dispatch<React.SetStateAction<IndicatorDefinition[]>>;
};

export const ChartDataContext = createContext<ChartDataContextValue | null>(null);

export const useChartData = () => {
  const ctx = useContext(ChartDataContext);
  if (!ctx) throw new Error("useChartData must be used within ChartDataProvider");
  return ctx;
};
