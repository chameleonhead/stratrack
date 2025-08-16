export type SymbolKind = "variable" | "function" | "type" | "constant";

export interface SymbolInfo {
  name: string;
  kind: SymbolKind;
  type: string; // int, double, custom struct, etc.
  scopeLevel: number; // ネストレベル（0=global, 1+=ローカル）
}

export class SymbolTable {
  private scopes: SymbolInfo[][] = [[]];

  enterScope() {
    this.scopes.push([]);
  }

  leaveScope() {
    this.scopes.pop();
  }

  define(symbol: SymbolInfo) {
    this.scopes[this.scopes.length - 1].push(symbol);
  }

  lookup(name: string): SymbolInfo | undefined {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const found = this.scopes[i].find((s) => s.name === name);
      if (found) return found;
    }
    return undefined;
  }
}
