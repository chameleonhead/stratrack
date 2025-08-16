export interface EnumMember {
  name: string;
  value?: string;
}

export interface SourceLocation {
  line: number;
  column: number;
}

export interface EnumDeclaration {
  type: "EnumDeclaration";
  name: string;
  members: EnumMember[];
  loc?: SourceLocation;
}

export interface ClassField {
  name: string;
  fieldType: string;
  dimensions: Array<number | null>;
  static?: boolean;
  loc?: SourceLocation;
}

export interface ClassMethod {
  name: string;
  returnType?: string;
  parameters: FunctionParameter[];
  visibility: "public" | "private" | "protected";
  static?: boolean;
  virtual?: boolean;
  override?: boolean;
  pure?: boolean;
  /** Local variable declarations inside the method */
  locals: VariableDeclaration[];
  /** Raw statement body text used for execution */
  body?: string;
  loc?: SourceLocation;
}

export interface ClassDeclaration {
  type: "ClassDeclaration";
  name: string;
  base?: string;
  abstract?: boolean;
  templateParams?: string[];
  fields: ClassField[];
  methods: ClassMethod[];
  loc?: SourceLocation;
}

export interface FunctionParameter {
  paramType: string;
  byRef: boolean;
  name: string;
  dimensions: Array<number | null>;
  defaultValue?: string;
}

export interface FunctionDeclaration {
  type: "FunctionDeclaration";
  returnType: string;
  name: string;
  parameters: FunctionParameter[];
  locals: VariableDeclaration[];
  /** Raw statement text for the function body */
  body?: string;
  templateParams?: string[];
  loc?: SourceLocation;
}

export interface VariableDeclaration {
  type: "VariableDeclaration";
  storage?: "static" | "input" | "extern";
  varType: string;
  name: string;
  dimensions: Array<number | null>;
  initialValue?: string;
  loc?: SourceLocation;
}

export interface ControlStatement {
  type: "ControlStatement";
  keyword: "if" | "for" | "while" | "do" | "switch";
  loc?: SourceLocation;
}

export type Declaration =
  | EnumDeclaration
  | ClassDeclaration
  | FunctionDeclaration
  | VariableDeclaration
  | ControlStatement;
