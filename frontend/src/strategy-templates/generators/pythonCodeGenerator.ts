export abstract class PyBlock {
  indentLevel = 0;

  constructor(indentLevel = 0) {
    this.indentLevel = indentLevel;
  }

  protected indent(code: string, extra = 0) {
    const spaces = "    ".repeat(this.indentLevel + extra);
    return code
      .split("\n")
      .map((line) => (line.trim() ? spaces + line : line))
      .join("\n");
  }

  abstract toString(): string;
}

export class PyIf extends PyBlock {
  body: PyBlock[] = [];

  constructor(public condition: string) {
    super();
  }

  add(...lines: PyBlock[]) {
    lines.forEach((line) => {
      line.indentLevel = this.indentLevel + 1;
      this.body.push(line);
    });
    return this;
  }

  toString() {
    const header = `if ${this.condition}:`;
    const body = this.indent(
      this.body.length ? this.body.map((b) => b.toString()).join("\n") : "pass"
    );
    return `${header}\n${body}`;
  }
}

export class PyFor extends PyBlock {
  body: PyBlock[] = [];

  constructor(
    public variable: string,
    public iterable: string
  ) {
    super();
  }

  add(...lines: PyBlock[]) {
    lines.forEach((line) => {
      line.indentLevel = this.indentLevel + 1;
      this.body.push(line);
    });
    return this;
  }

  toString() {
    const header = this.indent(`for ${this.variable} in ${this.iterable}:`);
    const body = this.indent(
      this.body.length ? this.body.map((b) => b.toString()).join("\n") : "pass"
    );
    return `${header}\n${body}`;
  }
}

export class PyExpr extends PyBlock {
  constructor(public expression: string) {
    super();
  }

  toString() {
    return this.expression;
  }
}

export class PyAssignment extends PyBlock {
  constructor(
    public variable: string,
    public value: string
  ) {
    super();
  }

  toString() {
    return `${this.variable} = ${this.value}`;
  }
}

export class PyFunction extends PyBlock {
  body: PyBlock[] = [];

  constructor(
    public name: string,
    public args: string[] = []
  ) {
    super();
  }

  add(...lines: PyBlock[]) {
    lines.forEach((line) => {
      line.indentLevel = this.indentLevel + 1;
      this.body.push(line);
    });
    return this;
  }

  toString() {
    const header = `def ${this.name}(${this.args.join(", ")}):`;
    const body = this.indent(
      this.body.length ? this.body.map((b) => b.toString()).join("\n") : "pass"
    );
    return `${header}\n${body}`;
  }
}

export class PyReturn extends PyBlock {
  constructor(public value?: string) {
    super();
  }

  toString() {
    return `return${this.value ? " " + this.value : ""}`;
  }
}

export class PyComment extends PyBlock {
  constructor(public comment: string) {
    super();
  }

  toString() {
    return this.indent(`# ${this.comment}`);
  }
}

export class PyClass extends PyBlock {
  body: PyBlock[] = [];

  constructor(
    public name: string,
    public baseClass?: string
  ) {
    super();
  }

  add(...lines: PyBlock[]) {
    lines.forEach((line) => {
      line.indentLevel = this.indentLevel + 1;
      this.body.push(line);
    });
    return this;
  }

  toString() {
    const base = this.baseClass ? `(${this.baseClass})` : "";
    const header = `class ${this.name}${base}:`;
    const body = this.indent(
      this.body.length ? this.body.map((b) => b.toString()).join("\n") : "pass",
      1
    );
    return `${header}\n${body}`;
  }
}

export class PyImport extends PyBlock {
  constructor(
    public module: string,
    public names?: string[]
  ) {
    super();
  }

  toString() {
    if (this.names && this.names.length) {
      return `from ${this.module} import ${this.names.join(", ")}`;
    }
    return `import ${this.module}`;
  }
}

export class PyModule {
  imports: PyImport[] = [];
  body: PyBlock[] = [];

  addImport(line: PyImport) {
    this.imports.push(line);
    return this;
  }

  add(...blocks: PyBlock[]) {
    this.body.push(...blocks);
    return this;
  }

  toString(): string {
    return [this.imports.join("\n"), "", ...this.body.map((b) => b.toString())].join("\n");
  }
}
