export interface EnumMember {
  name: string;
  value?: string;
}

export interface EnumDeclaration {
  type: 'EnumDeclaration';
  name: string;
  members: EnumMember[];
}

export interface ClassField {
  name: string;
  fieldType: string;
  dimensions: Array<number | null>;
  static?: boolean;
}

export interface ClassMethod {
  name: string;
  returnType?: string;
  parameters: FunctionParameter[];
  visibility: 'public' | 'private' | 'protected';
  static?: boolean;
  virtual?: boolean;
  pure?: boolean;
  /** Local variable declarations inside the method */
  locals: VariableDeclaration[];
  /** Raw statement body text used for execution */
  body?: string;
}

export interface ClassDeclaration {
  type: 'ClassDeclaration';
  name: string;
  base?: string;
  abstract?: boolean;
  templateParams?: string[];
  fields: ClassField[];
  methods: ClassMethod[];
}

export interface FunctionParameter {
  paramType: string;
  byRef: boolean;
  name: string;
  dimensions: Array<number | null>;
  defaultValue?: string;
}

export interface FunctionDeclaration {
  type: 'FunctionDeclaration';
  returnType: string;
  name: string;
  parameters: FunctionParameter[];
  locals: VariableDeclaration[];
  /** Raw statement text for the function body */
  body?: string;
  templateParams?: string[];
}

export interface VariableDeclaration {
  type: 'VariableDeclaration';
  storage?: 'static' | 'input' | 'extern';
  varType: string;
  name: string;
  dimensions: Array<number | null>;
  initialValue?: string;
}

export interface ControlStatement {
  type: 'ControlStatement';
  keyword: 'if' | 'for' | 'while' | 'do' | 'switch';
}

export type Declaration =
  | EnumDeclaration
  | ClassDeclaration
  | FunctionDeclaration
  | VariableDeclaration
  | ControlStatement;

import { Token, TokenType } from './lexer';

export function parse(tokens: Token[]): Declaration[] {
  const declarations: Declaration[] = [];
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = (type?: TokenType, value?: string): Token => {
    const token = tokens[pos];
    if (!token) throw new Error('Unexpected end of input');
    if (type && token.type !== type) {
      throw new Error(`Expected token type ${type} but found ${token.type}`);
    }
    if (value && token.value !== value) {
      throw new Error(`Expected token value ${value} but found ${token.value}`);
    }
    if (type === TokenType.Identifier && token.type === TokenType.Keyword) {
      throw new Error(`Reserved word ${token.value} cannot be used as identifier`);
    }
    pos++;
    return token;
  };

  const atEnd = () => pos >= tokens.length;

  function parseEnum(): EnumDeclaration {
    consume(TokenType.Keyword, 'enum');
    const name = consume(TokenType.Identifier).value;
    consume(TokenType.Punctuation, '{');
    const members: EnumMember[] = [];
    while (!atEnd() && peek().value !== '}') {
      const mName = consume(TokenType.Identifier).value;
      let mValue: string | undefined;
      if (!atEnd() && peek().value === '=') {
        consume(TokenType.Operator, '=');
        mValue = consume(TokenType.Number).value;
      }
      members.push({ name: mName, value: mValue });
      if (peek().value === ',') {
        consume(TokenType.Punctuation, ',');
      } else {
        break;
      }
    }
    consume(TokenType.Punctuation, '}');
    if (!atEnd() && peek().value === ';') {
      consume(TokenType.Punctuation, ';');
    }
    return { type: 'EnumDeclaration', name, members };
  }

  function skipBlock() {
    let depth = 0;
    while (!atEnd()) {
      const t = consume();
      if (t.value === '{') depth++;
      if (t.value === '}') {
        if (depth === 0) break;
        depth--;
      }
    }
  }

  function skipStatement() {
    while (!atEnd()) {
      const t = consume();
      if (t.value === ';') break;
      if (t.value === '{') {
        skipBlock();
        break;
      }
    }
  }

  function parseTemplateParameters(): string[] {
    consume(TokenType.Keyword, 'template');
    consume(TokenType.Operator, '<');
    const params: string[] = [];
    while (!atEnd()) {
      const kw = consume(TokenType.Keyword).value;
      if (kw !== 'class' && kw !== 'typename') {
        throw new Error('Expected class or typename in template parameter');
      }
      const id = consume(TokenType.Identifier).value;
      params.push(id);
      if (peek().value === '>') {
        consume(TokenType.Operator, '>');
        break;
      }
      consume(TokenType.Punctuation, ',');
    }
    return params;
  }

  function parseTemplate(): Declaration {
    const params = parseTemplateParameters();
    const next = peek();
    if (
      next.type === TokenType.Keyword &&
      (next.value === 'class' || next.value === 'struct' ||
        (next.value === 'abstract' &&
          (tokens[pos + 1]?.value === 'class' || tokens[pos + 1]?.value === 'struct')))
    ) {
      const cls = parseClass();
      cls.templateParams = params;
      return cls;
    }
    if (
      (next.type === TokenType.Keyword || next.type === TokenType.Identifier) &&
      (tokens[pos + 1]?.type === TokenType.Identifier ||
        (tokens[pos + 1]?.type === TokenType.Keyword && tokens[pos + 1].value === 'operator')) &&
      (tokens[pos + 2]?.value === '(' || tokens[pos + 3]?.value === '(')
    ) {
      const fn = parseFunction();
      fn.templateParams = params;
      return fn;
    }
    throw new Error('Unexpected template declaration');
  }

  function parseControlStatement(): ControlStatement {
    const kw = consume(TokenType.Keyword).value as ControlStatement['keyword'];
    skipStatement();
    return { type: 'ControlStatement', keyword: kw };
  }

  function parseClass(): ClassDeclaration {
    let isAbstract = false;
    if (!atEnd() && peek().type === TokenType.Keyword && peek().value === 'abstract') {
      consume(TokenType.Keyword, 'abstract');
      isAbstract = true;
    }
    const keyword = consume(TokenType.Keyword);
    if (keyword.value !== 'class' && keyword.value !== 'struct') {
      throw new Error(`Expected class or struct keyword but found ${keyword.value}`);
    }
    const className = consume(TokenType.Identifier).value;
    let base: string | undefined;
    if (!atEnd() && peek().value === ':') {
      consume(TokenType.Punctuation, ':');
      base = consume(TokenType.Identifier).value;
    }
    consume(TokenType.Punctuation, '{');
    const fields: ClassField[] = [];
    const methods: ClassMethod[] = [];
    let visibility: 'public' | 'private' | 'protected' = 'private';
    while (!atEnd() && peek().value !== '}') {
      const start = peek();
      const next = tokens[pos + 1];
      const third = tokens[pos + 2];
      if (
        start.type === TokenType.Keyword &&
        (start.value === 'public' || start.value === 'private' || start.value === 'protected') &&
        next?.value === ':'
      ) {
        visibility = start.value as 'public' | 'private' | 'protected';
        consume();
        consume(TokenType.Punctuation, ':');
        continue;
      }
      let isStatic = false;
      let isVirtual = false;
      while (
        !atEnd() &&
        peek().type === TokenType.Keyword &&
        (peek().value === 'static' || peek().value === 'virtual')
      ) {
        const kw = consume(TokenType.Keyword).value;
        if (kw === 'static') isStatic = true;
        if (kw === 'virtual') isVirtual = true;
      }

      const s = peek();
      const n = tokens[pos + 1];
      const t = tokens[pos + 2];

      if (
        (s.type === TokenType.Keyword || s.type === TokenType.Identifier) &&
        n?.type === TokenType.Identifier
      ) {
        let idx = pos + 2;
        while (tokens[idx]?.value === '[') {
          idx++;
          if (tokens[idx]?.type === TokenType.Number) idx++;
          if (tokens[idx]?.value !== ']') break;
          idx++;
        }
        if (tokens[idx]?.value === ';') {
          const fieldType = consume().value;
          if (fieldType === 'void') {
            throw new Error('void type cannot be used for fields');
          }
          const fieldName = consume(TokenType.Identifier).value;
          const dims: Array<number | null> = [];
          while (peek().value === '[') {
            consume(TokenType.Punctuation, '[');
            let size: number | null = null;
            if (peek().type === TokenType.Number) {
              size = parseInt(consume(TokenType.Number).value, 10);
            }
            consume(TokenType.Punctuation, ']');
            dims.push(size);
          }
          consume(TokenType.Punctuation, ';');
          fields.push({ name: fieldName, fieldType, dimensions: dims, static: isStatic });
          continue;
        }
      }
      const isConstructor =
        s.type === TokenType.Identifier && s.value === className && n?.value === '(';
      const isDestructor =
        s.type === TokenType.Operator && s.value === '~' && n?.type === TokenType.Identifier && n.value === className && tokens[pos + 2]?.value === '(';
      const isMethod =
        (s.type === TokenType.Keyword || s.type === TokenType.Identifier) &&
        (n?.type === TokenType.Identifier || (n?.type === TokenType.Keyword && n.value === 'operator')) &&
        (t?.value === '(' || tokens[pos + 3]?.value === '(');
      if (isConstructor || isDestructor || isMethod) {
        let returnType: string | undefined;
        let methodName: string;
        if (isConstructor) {
          consume(TokenType.Identifier); // class name
          methodName = className;
        } else if (isDestructor) {
          consume(TokenType.Operator, '~');
          consume(TokenType.Identifier, className);
          methodName = '~' + className;
        } else {
          returnType = consume().value;
          let nameTok = consume();
          methodName = nameTok.value;
          if (nameTok.type === TokenType.Keyword && nameTok.value === 'operator') {
            methodName = 'operator';
            while (!atEnd() && peek().value !== '(') {
              methodName += tokens[pos].value;
              pos++;
            }
          } else if (nameTok.type !== TokenType.Identifier) {
            throw new Error('Expected method name');
          }
        }
        consume(TokenType.Punctuation, '(');
        const parameters: FunctionParameter[] = [];
        while (!atEnd() && peek().value !== ')') {
          const pType = consume().value;
          let byRef = false;
          if (peek().value === '&') {
            consume(TokenType.Operator, '&');
            byRef = true;
          }
          const pName = consume(TokenType.Identifier).value;
          const dims: Array<number | null> = [];
          while (peek().value === '[') {
            consume(TokenType.Punctuation, '[');
            let size: number | null = null;
            if (peek().type === TokenType.Number) {
              size = parseInt(consume(TokenType.Number).value, 10);
            }
            consume(TokenType.Punctuation, ']');
            dims.push(size);
          }
          let defaultValue: string | undefined;
          if (peek().value === '=') {
            consume(TokenType.Operator, '=');
            defaultValue = consume().value;
          }
          parameters.push({
            paramType: pType,
            byRef,
            name: pName,
            dimensions: dims,
            defaultValue,
          });
          if (peek().value === ',') {
            consume(TokenType.Punctuation, ',');
          } else {
            break;
          }
        }
        consume(TokenType.Punctuation, ')');
        let isPure = false;
        if (!atEnd() && peek().value === '=') {
          const save = pos;
          consume(TokenType.Operator, '=');
          if (!atEnd() && peek().type === TokenType.Number && peek().value === '0') {
            consume(TokenType.Number, '0');
            consume(TokenType.Punctuation, ';');
            isPure = true;
          } else {
            pos = save;
          }
        }
        const locals: VariableDeclaration[] = [];
        let body: string | undefined;
        if (!isPure && !atEnd() && peek().value === '{') {
          consume(TokenType.Punctuation, '{');
          let bodyStart = pos;
          while (!atEnd() && peek().value !== '}') {
            const startPos = pos;
            try {
              const vd = parseVariable();
              locals.push(vd);
              bodyStart = pos;
              continue;
            } catch {
              pos = startPos;
            }
            const tok = peek();
            if (
              tok.type === TokenType.Keyword &&
              ['for', 'while', 'do', 'switch', 'if'].includes(tok.value)
            ) {
              parseControlStatement();
            } else if (tok.value === '{') {
              consume(TokenType.Punctuation, '{');
              skipBlock();
            } else {
              skipStatement();
            }
          }
          const bodyTokens = tokens.slice(bodyStart, pos);
          body = bodyTokens.map((t) => t.value).join(' ');
          consume(TokenType.Punctuation, '}');
        } else if (!isPure && !atEnd() && peek().value === ';') {
          consume(TokenType.Punctuation, ';');
        }
        methods.push({
          name: methodName,
          returnType,
          parameters,
          visibility,
          static: isStatic,
          virtual: isVirtual,
          pure: isPure,
          locals,
          body,
        });
        continue;
      }
      // unknown token inside class - skip
      if (peek().value === '{') {
        consume(TokenType.Punctuation, '{');
        skipBlock();
      } else {
        pos++;
      }
    }
    consume(TokenType.Punctuation, '}');
    if (!atEnd() && peek().value === ';') {
      consume(TokenType.Punctuation, ';');
    }
    return { type: 'ClassDeclaration', name: className, base, abstract: isAbstract, fields, methods };
  }

  function parseFunction(): FunctionDeclaration {
    const returnType = consume().value;
    let nameToken = consume();
    let name = nameToken.value;
    if (nameToken.type === TokenType.Keyword && nameToken.value === 'operator') {
      name = 'operator';
      while (!atEnd() && peek().value !== '(') {
        name += tokens[pos].value;
        pos++;
      }
    } else if (nameToken.type !== TokenType.Identifier) {
      throw new Error('Expected function name');
    }
    consume(TokenType.Punctuation, '(');
    const parameters: FunctionParameter[] = [];
    while (!atEnd() && peek().value !== ')') {
      const pType = consume().value;
      let byRef = false;
      if (peek().value === '&') {
        consume(TokenType.Operator, '&');
        byRef = true;
      }
      const pName = consume(TokenType.Identifier).value;
      const dims: Array<number | null> = [];
      while (peek().value === '[') {
        consume(TokenType.Punctuation, '[');
        let size: number | null = null;
        if (peek().type === TokenType.Number) {
          size = parseInt(consume(TokenType.Number).value, 10);
        }
        consume(TokenType.Punctuation, ']');
        dims.push(size);
      }
      let defaultValue: string | undefined;
      if (peek().value === '=') {
        consume(TokenType.Operator, '=');
        defaultValue = consume().value;
      }
      parameters.push({
        paramType: pType,
        byRef,
        name: pName,
        dimensions: dims,
        defaultValue,
      });
      if (peek().value === ',') {
        consume(TokenType.Punctuation, ',');
      } else {
        break;
      }
    }
    consume(TokenType.Punctuation, ')');
    const locals: VariableDeclaration[] = [];
    let body = '';
    if (!atEnd() && peek().value === '{') {
      consume(TokenType.Punctuation, '{');
      let bodyStart = pos;
      while (!atEnd() && peek().value !== '}') {
        const startPos = pos;
        try {
          const varDecl = parseVariable();
          locals.push(varDecl);
          bodyStart = pos;
          continue;
        } catch {
          pos = startPos;
        }
        const t = peek();
        if (
          t.type === TokenType.Keyword &&
          ['for', 'while', 'do', 'switch', 'if'].includes(t.value)
        ) {
          parseControlStatement();
        } else if (t.value === '{') {
          consume(TokenType.Punctuation, '{');
          skipBlock();
        } else {
          skipStatement();
        }
      }
      const bodyTokens = tokens.slice(bodyStart, pos);
      body = bodyTokens.map((t) => t.value).join(' ');
      consume(TokenType.Punctuation, '}');
    } else if (!atEnd() && peek().value === ';') {
      consume(TokenType.Punctuation, ';');
    }
    return { type: 'FunctionDeclaration', returnType, name, parameters, locals, body };
  }

  function parseVariable(): VariableDeclaration {
    const typeKeywords = new Set([
      'void','bool','char','uchar','short','ushort','int','uint','long','ulong',
      'float','double','color','datetime','string'
    ]);
    let storage: 'static' | 'input' | 'extern' | undefined;
    if (
      peek().type === TokenType.Keyword &&
      (peek().value === 'static' || peek().value === 'input' || peek().value === 'extern')
    ) {
      storage = consume(TokenType.Keyword).value as 'static' | 'input' | 'extern';
    }
    const next = peek();
    if (
      !(next.type === TokenType.Identifier || (next.type === TokenType.Keyword && typeKeywords.has(next.value)))
    ) {
      throw new Error('Not a variable declaration');
    }
    const varType = consume().value;
    const name = consume(TokenType.Identifier).value;
    const dims: Array<number | null> = [];
    while (peek().value === '[') {
      consume(TokenType.Punctuation, '[');
      let size: number | null = null;
      if (peek().type === TokenType.Number) {
        size = parseInt(consume(TokenType.Number).value, 10);
      }
      consume(TokenType.Punctuation, ']');
      dims.push(size);
    }
    let initialValue: string | undefined;
    if (peek().value === '=') {
      consume(TokenType.Operator, '=');
      initialValue = consume().value;
    }
    consume(TokenType.Punctuation, ';');
    return { type: 'VariableDeclaration', storage, varType, name, dimensions: dims, initialValue };
  }

  while (!atEnd()) {
    const token = peek();
    if (
      token.type === TokenType.Keyword &&
      ['for', 'while', 'do', 'switch', 'if'].includes(token.value)
    ) {
      declarations.push(parseControlStatement());
      continue;
    }
    if (token.type === TokenType.Keyword && token.value === 'template') {
      declarations.push(parseTemplate());
      continue;
    }
    if (token.type === TokenType.Keyword && token.value === 'enum') {
      declarations.push(parseEnum());
    } else if (
      token.type === TokenType.Keyword &&
      (token.value === 'class' || token.value === 'struct' ||
        (token.value === 'abstract' &&
          (tokens[pos + 1]?.value === 'class' || tokens[pos + 1]?.value === 'struct')))
    ) {
      declarations.push(parseClass());
    } else if (
      (token.type === TokenType.Keyword || token.type === TokenType.Identifier) &&
      (tokens[pos + 1]?.type === TokenType.Identifier ||
        (tokens[pos + 1]?.type === TokenType.Keyword && tokens[pos + 1].value === 'operator')) &&
      (tokens[pos + 2]?.value === '(' || tokens[pos + 3]?.value === '(')
    ) {
      declarations.push(parseFunction());
    } else if (
      (token.type === TokenType.Keyword &&
        ['static', 'input', 'extern'].includes(token.value)) ||
      ((token.type === TokenType.Keyword || token.type === TokenType.Identifier) &&
        (tokens[pos + 1]?.type === TokenType.Identifier || tokens[pos + 1]?.type === TokenType.Keyword))
    ) {
      const start = pos;
      try {
        declarations.push(parseVariable());
      } catch {
        pos = start + 1;
      }
    } else {
      pos++;
    }
  }

  return declarations;
}

