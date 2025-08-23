export interface IndicatorKey {
  type: string;
  symbol: string;
  timeframe: number;
  params: unknown;
}
export class IndicatorCache {
  private cache = new Map<string, any>();

  private key(k: IndicatorKey): string {
    return `${k.type}:${k.symbol}:${k.timeframe}:${JSON.stringify(k.params)}`;
  }

  getOrCreate<T extends { last: number }>(key: IndicatorKey, init: () => T): T {
    const k = this.key(key);
    let entry = this.cache.get(k) as T | undefined;
    if (!entry) {
      entry = init();
      this.cache.set(k, entry);
    }
    return entry;
  }

  peek<T extends { last: number }>(key: IndicatorKey): T | undefined {
    return this.cache.get(this.key(key));
  }
}
