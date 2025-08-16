import type { VariableDeclaration } from "../parser/parser.js";

export interface RuntimeClassField {
  type: string;
  dimensions: Array<number | null>;
  static?: boolean;
}

export interface RuntimeFunctionParameter {
  type: string;
  byRef: boolean;
  name: string;
  dimensions: Array<number | null>;
  defaultValue?: string;
}

export interface RuntimeClassMethod {
  name: string;
  returnType?: string;
  parameters: RuntimeFunctionParameter[];
  visibility: "public" | "private" | "protected";
  static?: boolean;
  virtual?: boolean;
  override?: boolean;
  pure?: boolean;
  locals: VariableDeclaration[];
  body?: string;
}

export type ProgramType = "expert" | "script" | "indicator";

export interface Runtime {
  enums: Record<string, Record<string, number>>;
  classes: Record<
    string,
    {
      base?: string;
      abstract?: boolean;
      templateParams?: string[];
      fields: Record<string, RuntimeClassField>;
      methods: RuntimeClassMethod[];
    }
  >;
  functions: Record<
    string,
    {
      returnType: string;
      parameters: RuntimeFunctionParameter[];
      locals: VariableDeclaration[];
      body?: string;
      templateParams?: string[];
    }[]
  >;
  variables: Record<
    string,
    {
      type: string;
      storage?: "static" | "input" | "extern";
      dimensions: Array<number | null>;
      initialValue?: string;
    }
  >;
  properties: Record<string, string[]>;
  /** Stored values of static local variables keyed by function name */
  staticLocals: Record<string, Record<string, any>>;
  /** Values of global variables */
  globalValues: Record<string, any>;
  /** Execution context used when running entry points */
  context?: ExecutionContext;
  /** Program classification (expert, script, indicator) */
  programType?: ProgramType;
  /** Context for the current trade event if inside OnTrade */
  tradeContext?: { ticket: number; type: "buy" | "sell" };
}

/** Options for executing code. */
export interface ExecutionContext {
  /** Entry point function name. */
  entryPoint?: string;
  /** Arguments to pass to the entry point. */
  args?: any[];
  /** Values for variables declared with the `input` keyword. */
  inputValues?: Record<string, any>;
  /** Values for variables declared with the `extern` keyword. */
  externValues?: Record<string, any>;
}
