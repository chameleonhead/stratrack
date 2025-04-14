export class MqlFile {
  constructor(
    public type: "expert" | "indicator",
    public globalVars: MqlGlobalVariable[],
    public functions: MqlFunction[],
    public properties: string[] = [],
    public buffers: MqlIndexBuffer[] = []
  ) {}

  toString(): string {
    const lines: string[] = [];
    lines.push(...this.properties.map((p) => `#property ${p}`));
    lines.push("#property strict\n");
    for (const buf of this.buffers) {
      lines.push(`double ${buf.name}[];`);
    }
    for (const v of this.globalVars) {
      lines.push(`${v.type} ${v.name};`);
    }
    for (const fn of this.functions) {
      lines.push("\n" + fn.toString());
    }
    return lines.join("\n");
  }
}

export class MqlGlobalVariable {
  constructor(
    public name: string,
    public type: string,
    public init?: string
  ) {}
}

export class MqlFunction {
  constructor(
    public name: string,
    public returnType: string,
    public body: MqlStatement[],
    public args: MqlArgument[] = []
  ) {}

  toString(): string {
    const header = `${this.returnType} ${this.name}(${this.args.map((a) => `${a.type} ${a.name}`).join(", ")})`;
    const bodyStr = this.body.map((stmt) => stmt.toString("  ")).join("\n");
    return `${header} {\n${bodyStr}\n}`;
  }
}

export class MqlArgument {
  constructor(
    public name: string,
    public type: string
  ) {}
}

export class MqlIndexBuffer {
  constructor(
    public index: number,
    public name: string,
    public style?: string,
    public label?: string
  ) {}
}
export abstract class MqlExpression {
  abstract toString(): string;
}

export class MqlLiteral extends MqlExpression {
  constructor(public value: string) {
    super();
  }
  toString(): string {
    return this.value;
  }
}

export class MqlVariableRef extends MqlExpression {
  constructor(public name: string) {
    super();
  }
  toString(): string {
    return this.name;
  }
}

export class MqlUnaryExpr extends MqlExpression {
  constructor(
    public operator: string,
    public value: MqlExpression
  ) {
    super();
  }
  toString(): string {
    return `${this.operator} ${this.value.toString()}`;
  }
}

export class MqlBinaryExpr extends MqlExpression {
  constructor(
    public left: MqlExpression,
    public operator: string,
    public right: MqlExpression
  ) {
    super();
  }
  toString(): string {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}

export class MqlTernaryExpr extends MqlExpression {
  constructor(
    public condition: MqlExpression,
    public trueExpr: MqlExpression,
    public falseExpr: MqlExpression
  ) {
    super();
  }
  toString(): string {
    return `${this.condition.toString()} ? ${this.trueExpr.toString()} : ${this.falseExpr.toString()}`;
  }
}

export class MqlFunctionCallExpr extends MqlExpression {
  constructor(
    public name: string,
    public args: MqlExpression[]
  ) {
    super();
  }
  toString(): string {
    return `${this.name}(${this.args.map((a) => a.toString()).join(", ")})`;
  }
}

// ----------------- Statement Types -----------------

export abstract class MqlStatement {
  abstract toString(indent?: string): string;
}

export class MqlExprStatement extends MqlStatement {
  constructor(public expr: MqlExpression) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}${this.expr.toString()};`;
  }
}

export class MqlDecl extends MqlStatement {
  constructor(
    public name: string,
    public varType: string,
    public init?: MqlExpression
  ) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}${this.varType} ${this.name}${this.init ? ` = ${this.init.toString()}` : ""};`;
  }
}

export class MqlIf extends MqlStatement {
  constructor(
    public condition: MqlExpression,
    public then: MqlStatement[],
    public elseBranch?: MqlStatement[]
  ) {
    super();
  }
  toString(indent = "  "): string {
    const lines = [`${indent}if (${this.condition.toString()}) {`];
    lines.push(...this.then.map((s) => s.toString(indent + "  ")));
    if (this.elseBranch) {
      lines.push(`${indent}} else {`);
      lines.push(...this.elseBranch.map((s) => s.toString(indent + "  ")));
    }
    lines.push(`${indent}}`);
    return lines.join("\n");
  }
}

export class MqlReturn extends MqlStatement {
  constructor(public expr?: MqlExpression) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}return${this.expr ? ` ${this.expr.toString()}` : ""};`;
  }
}

export class MqlFor extends MqlStatement {
  constructor(
    public init: MqlStatement, // 通常 MqlDecl or MqlExprStatement
    public condition: MqlExpression,
    public increment: MqlStatement,
    public body: MqlStatement[]
  ) {
    super();
  }
  toString(indent = "  "): string {
    const initStr =
      this.init instanceof MqlExprStatement || this.init instanceof MqlDecl
        ? this.init.toString("").replace(/;$/, "")
        : this.init.toString("");

    const incrementStr =
      this.increment instanceof MqlExprStatement
        ? this.increment.toString("").replace(/;$/, "")
        : this.increment.toString("");

    const lines = [`${indent}for (${initStr}; ${this.condition.toString()}; ${incrementStr}) {`];
    lines.push(...this.body.map((stmt) => stmt.toString(indent + "  ")));
    lines.push(`${indent}}`);
    return lines.join("\n");
  }
}

// --- Statement and Expression Types ---

export class MqlComment extends MqlStatement {
  constructor(public text: string) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}// ${this.text}`;
  }
}

export class MqlWhile extends MqlStatement {
  constructor(
    public condition: string,
    public body: MqlStatement[]
  ) {
    super();
  }

  toString(indent = "  "): string {
    const lines = [`${indent}while (${this.condition}) {`];
    lines.push(...this.body.map((stmt) => stmt.toString(indent + "  ")));
    lines.push(`${indent}}`);
    return lines.join("\n");
  }
}

export class MqlBlock extends MqlStatement {
  constructor(public body: MqlStatement[]) {
    super();
  }
  toString(indent = "  ") {
    const lines = [`${indent}{`];
    lines.push(...this.body.map((stmt) => stmt.toString(indent + "  ")));
    lines.push(`${indent}}`);
    return lines.join("\n");
  }
}

export class MqlFunctionCall extends MqlStatement {
  constructor(
    public name: string,
    public args: string[]
  ) {
    super();
  }
  toString(indent = "  ") {
    return `${indent}${this.name}(${this.args.join(", ")});`;
  }
}

export class MqlStruct extends MqlStatement {
  constructor(
    public name: string,
    public fields: MqlGlobalVariable[]
  ) {
    super();
  }
  toString(indent = "  ") {
    const lines = [`${indent}struct ${this.name} {`];
    for (const f of this.fields) {
      lines.push(`${indent}  ${f.type} ${f.name};`);
    }
    lines.push(`${indent}};`);
    return lines.join("\n");
  }
}
