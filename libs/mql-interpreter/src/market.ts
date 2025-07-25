export interface Tick {
  time: number;
  bid: number;
  ask: number;
}

export class MarketData {
  private ticks: Record<string, Tick[]> = {};
  private positions: Record<string, number> = {};
  private selected: Set<string> = new Set();

  constructor(data: Record<string, Tick[]>) {
    for (const symbol in data) {
      this.ticks[symbol] = [...data[symbol]].sort((a, b) => a.time - b.time);
      this.positions[symbol] = 0;
      this.selected.add(symbol);
    }
  }

  getSymbols(selectedOnly = false): string[] {
    if (selectedOnly) return Array.from(this.selected);
    return Object.keys(this.ticks);
  }

  select(symbol: string, enable: boolean): boolean {
    if (!(symbol in this.ticks)) return false;
    if (enable) this.selected.add(symbol); else this.selected.delete(symbol);
    return true;
  }

  /** Return latest tick at or before the given time */
  getTick(symbol: string, time: number): Tick | undefined {
    const arr = this.ticks[symbol];
    if (!arr || !arr.length) return undefined;
    let pos = this.positions[symbol];
    while (pos + 1 < arr.length && arr[pos + 1].time <= time) pos++;
    this.positions[symbol] = pos;
    return arr[pos];
  }
}
