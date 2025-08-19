export interface FunctionArg {
  name: string;
  type: string;
  optional?: boolean;
  variadic?: boolean;
}

export interface FunctionSignature {
  args: FunctionArg[];
  returnType: string;
  description: string;
}

export type BuiltinSignaturesMap = Record<string, FunctionSignature | FunctionSignature[]>;
