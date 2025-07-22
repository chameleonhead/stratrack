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
}

export interface ClassMethod {
  name: string;
  returnType?: string;
  parameters: FunctionParameter[];
  visibility: 'public' | 'private' | 'protected';
}

export interface ClassDeclaration {
  type: 'ClassDeclaration';
  name: string;
  base?: string;
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
}

export type Declaration = EnumDeclaration | ClassDeclaration | FunctionDeclaration;

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

  function parseClass(): ClassDeclaration {
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
      // field declaration possibly with array dimensions
      if (
        (start.type === TokenType.Keyword || start.type === TokenType.Identifier) &&
        next?.type === TokenType.Identifier
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
          fields.push({ name: fieldName, fieldType, dimensions: dims });
          continue;
        }
      }
      const isConstructor =
        start.type === TokenType.Identifier && start.value === className && next?.value === '(';
      const isDestructor =
        start.type === TokenType.Operator && start.value === '~' && next?.type === TokenType.Identifier && next.value === className && tokens[pos + 2]?.value === '(';
      const isMethod =
        (start.type === TokenType.Keyword || start.type === TokenType.Identifier) &&
        (next?.type === TokenType.Identifier || (next?.type === TokenType.Keyword && next.value === 'operator')) &&
        (third?.value === '(' || tokens[pos + 3]?.value === '(');
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
        if (!atEnd() && peek().value === '{') {
          consume(TokenType.Punctuation, '{');
          skipBlock();
        } else if (!atEnd() && peek().value === ';') {
          consume(TokenType.Punctuation, ';');
        }
        methods.push({ name: methodName, returnType, parameters, visibility });
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
    return { type: 'ClassDeclaration', name: className, base, fields, methods };
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
    if (!atEnd() && peek().value === '{') {
      consume(TokenType.Punctuation, '{');
      skipBlock();
    } else if (!atEnd() && peek().value === ';') {
      consume(TokenType.Punctuation, ';');
    }
    return { type: 'FunctionDeclaration', returnType, name, parameters };
  }

  while (!atEnd()) {
    const token = peek();
    if (token.type === TokenType.Keyword && token.value === 'enum') {
      declarations.push(parseEnum());
    } else if (
      token.type === TokenType.Keyword &&
      (token.value === 'class' || token.value === 'struct')
    ) {
      declarations.push(parseClass());
    } else if (
      (token.type === TokenType.Keyword || token.type === TokenType.Identifier) &&
      (tokens[pos + 1]?.type === TokenType.Identifier ||
        (tokens[pos + 1]?.type === TokenType.Keyword && tokens[pos + 1].value === 'operator')) &&
      (tokens[pos + 2]?.value === '(' || tokens[pos + 3]?.value === '(')
    ) {
      declarations.push(parseFunction());
    } else {
      pos++;
    }
  }

  return declarations;
}

