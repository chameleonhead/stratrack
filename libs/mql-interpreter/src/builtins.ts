export type BuiltinFunction = (...args: any[]) => any;

const builtins: Record<string, BuiltinFunction> = {
  Print: (...args: any[]) => {
    console.log(...args);
    return 0;
  },
  OrderSend: (..._args: any[]) => 0,
  iMA: (..._args: any[]) => 0,
};

export function getBuiltin(name: string): BuiltinFunction | undefined {
  return builtins[name];
}
