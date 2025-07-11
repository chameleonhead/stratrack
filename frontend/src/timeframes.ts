export const TIMEFRAME_OPTIONS = [
  { value: "tick", label: "ティック" },
  { value: "1m", label: "1分足" },
  { value: "5m", label: "5分足" },
  { value: "15m", label: "15分足" },
  { value: "30m", label: "30分足" },
  { value: "1h", label: "1時間足" },
  { value: "2h", label: "2時間足" },
  { value: "4h", label: "4時間足" },
  { value: "1d", label: "日足" },
];

export function timeframeToMs(tf: string): number {
  switch (tf) {
    case "1m":
      return 60_000;
    case "5m":
      return 5 * 60_000;
    case "15m":
      return 15 * 60_000;
    case "30m":
      return 30 * 60_000;
    case "1h":
      return 60 * 60_000;
    case "2h":
      return 2 * 60 * 60_000;
    case "4h":
      return 4 * 60 * 60_000;
    case "1d":
      return 24 * 60 * 60_000;
    default:
      return 0;
  }
}
