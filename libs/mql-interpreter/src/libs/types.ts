export type MqlFunction = (...args: any[]) => any;

export interface MqlLibrary {
  [name: string]: MqlFunction;
}
