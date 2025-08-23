export interface VirtualFile {
  name: string;
  data: string;
  position: number;
}

export interface TerminalStorage {
  /**
   * Read previously stored global variable data. Should return a JSON string
   * or `undefined` when no data exists.
   */
  read: () => string | undefined;
  /** Persist global variable data. */
  write: (data: string) => void;
}

export interface ChartEvent {
  id: number;
  lparam: number;
  dparam: number;
  sparam: string;
}

export interface ITerminal {
  // File operations
  open(name: string, mode?: string): number;
  read(handle: number): string | undefined;
  write(handle: number, text: string): void;
  close(handle: number): void;
  exists(name: string): boolean;
  getFile(name: string): string | undefined;

  // Global variable operations
  setGlobalVariable(name: string, value: number): number;
  getGlobalVariable(name: string): number;
  deleteGlobalVariable(name: string): boolean;
  checkGlobalVariable(name: string): boolean;
  getGlobalVariableTime(name: string): number;
  deleteAllGlobalVariables(prefix?: string): number;
  globalVariablesTotal(): number;
  getGlobalVariableName(index: number): string;
  setGlobalVariableTemp(name: string, value: number): number;
  setGlobalVariableOnCondition(name: string, value: number, check: number): boolean;
  flushGlobalVariables(): number;

  // Timer operations
  setTimer(seconds: number): void;
  killTimer(): void;
  shouldTriggerTimer(time: number): boolean;

  // Chart event operations
  queueChartEvent(id: number, lparam: number, dparam: number, sparam: string): void;
  consumeChartEvents(): ChartEvent[];

  // UI operations
  print(...args: any[]): number;
  comment(...args: any[]): number;
  alert(...args: any[]): boolean;
  playSound(file: string): boolean;

  // Chart operations
  getChartId(): number;
  getChartSymbol(chartId?: number): string;
  getChartPeriod(chartId?: number): number;
  getChartProperty(chartId: number, propId: number, subWindow?: number): any;
  setChartProperty(chartId: number, propId: number, value: any, subWindow?: number): boolean;
  redrawChart(chartId?: number): boolean;
  getWindowInfo(subWindow?: number): any;
}
