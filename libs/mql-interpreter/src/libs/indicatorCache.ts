export interface IndicatorKey {
  type: string;
  symbol: string;
  timeframe: number;
  params: unknown;
}

interface CacheEntry {
  values: number[];
  last: number; // index of last computed bar
}

export class IndicatorCache {
  private cache = new Map<string, CacheEntry>();

  private key(k: IndicatorKey): string {
    return `${k.type}:${k.symbol}:${k.timeframe}:${JSON.stringify(k.params)}`;
  }

  private computeRange(
    entry: CacheEntry,
    from: number,
    to: number,
    compute: (index: number) => number
  ): void {
    for (let i = from; i <= to; i++) {
      entry.values[i] = compute(i);
    }
  }

  get(key: IndicatorKey, totalBars: number, compute: (index: number) => number): number[] {
    const k = this.key(key);
    let entry = this.cache.get(k);
    if (!entry) {
      entry = { values: [], last: -1 };
      this.cache.set(k, entry);
    }
    if (entry.last < totalBars - 1) {
      this.computeRange(entry, entry.last + 1, totalBars - 1, compute);
      entry.last = totalBars - 1;
    }
    return entry.values;
  }
}
