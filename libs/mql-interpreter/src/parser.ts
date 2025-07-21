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

export interface ClassDeclaration {
  type: 'ClassDeclaration';
  name: string;
  base?: string;
  fields: ClassField[];
}

export type Declaration = EnumDeclaration | ClassDeclaration;

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
    const name = consume(TokenType.Identifier).value;
    let base: string | undefined;
    if (!atEnd() && peek().value === ':') {
      consume(TokenType.Punctuation, ':');
      base = consume(TokenType.Identifier).value;
    }
    consume(TokenType.Punctuation, '{');
    const fields: ClassField[] = [];
    while (!atEnd() && peek().value !== '}') {
      const start = peek();
      const next = tokens[pos + 1];
      const third = tokens[pos + 2];
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
      // skip method declarations/definitions
      if (
        (start.type === TokenType.Keyword || start.type === TokenType.Identifier) &&
        next?.type === TokenType.Identifier &&
        third?.value === '('
      ) {
        // skip until opening brace or semicolon
        consume();
        consume(TokenType.Identifier);
        consume(TokenType.Punctuation, '(');
        while (!atEnd() && peek().value !== ')' ) consume();
        consume(TokenType.Punctuation, ')');
        if (!atEnd() && peek().value === '{') {
          consume(TokenType.Punctuation, '{');
          skipBlock();
        } else if (!atEnd() && peek().value === ';') {
          consume(TokenType.Punctuation, ';');
        }
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
    return { type: 'ClassDeclaration', name, base, fields };
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
    } else {
      pos++;
    }
  }

  return declarations;
}

