export interface IndicatorSource {
  get(name: string): string | undefined;
}

export class InMemoryIndicatorSource implements IndicatorSource {
  private files: Record<string, string>;

  constructor(initial: Record<string, string> = {}) {
    this.files = { ...initial };
  }

  get(name: string): string | undefined {
    return this.files[name];
  }

  set(name: string, source: string): void {
    this.files[name] = source;
  }
}
