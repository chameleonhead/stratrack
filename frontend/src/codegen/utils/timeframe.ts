export const TIMEFRAME_MINUTES: Record<string, number> = {
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "2h": 120,
  "4h": 240,
  "1d": 1440,
};

export function timeframeToMinutes(tf: string): number {
  return TIMEFRAME_MINUTES[tf] ?? 1;
}

export function resolveHigherTimeframe(base: string, level: number): string {
  const order = Object.keys(TIMEFRAME_MINUTES);
  const index = order.indexOf(base);
  const next = index + level;
  return order[Math.min(order.length - 1, Math.max(0, next))] || base;
}
import { IRTimeframeExpression } from "../ir/ast";

export function resolveTimeframeExpression(
  expr: IRTimeframeExpression | undefined,
  base: string
): string {
  if (!expr) return base;
  switch (expr.type) {
    case "constant":
      return expr.value;
    case "higher_timeframe":
      return resolveHigherTimeframe(base, expr.level);
    default:
      return base;
  }
}

export function timeframeToPeriod(tf: string): string {
  const map: Record<string, string> = {
    "1m": "PERIOD_M1",
    "5m": "PERIOD_M5",
    "15m": "PERIOD_M15",
    "30m": "PERIOD_M30",
    "1h": "PERIOD_H1",
    "2h": "PERIOD_H2",
    "4h": "PERIOD_H4",
    "1d": "PERIOD_D1",
  };
  return map[tf] ?? "PERIOD_CURRENT";
}
