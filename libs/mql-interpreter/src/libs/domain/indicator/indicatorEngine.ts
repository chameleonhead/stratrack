import { IndicatorCache, type IndicatorKey } from "./indicatorCache";
import { InMemoryIndicatorSource } from "./indicatorSource";

export interface IndicatorEngine {
  getSource(name: string): string | undefined;
  getOrCreate<T extends { last: number }>(key: IndicatorKey, init: () => T): T;
  peek<T extends { last: number }>(key: IndicatorKey): T | undefined;
}

export class InMemoryIndicatorEngine implements IndicatorEngine {
  private cache: IndicatorCache;
  public source: InMemoryIndicatorSource;

  constructor(source?: InMemoryIndicatorSource) {
    this.source = source ?? new InMemoryIndicatorSource();
    this.cache = new IndicatorCache();
  }

  getSource(name: string): string | undefined {
    return this.source.get(name);
  }

  set(name: string, src: string): void {
    this.source.set(name, src);
  }

  getOrCreate<T extends { last: number }>(key: IndicatorKey, init: () => T): T {
    return this.cache.getOrCreate(key, init);
  }

  peek<T extends { last: number }>(key: IndicatorKey): T | undefined {
    return this.cache.peek(key);
  }
}
