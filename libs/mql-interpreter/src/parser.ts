export interface EnumMember {
  name: string;
  value?: string;
}

export interface EnumDeclaration {
  type: 'EnumDeclaration';
  name: string;
  members: EnumMember[];
}

export interface ClassDeclaration {
  type: 'ClassDeclaration';
  name: string;
  base?: string;
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
    consume(TokenType.Keyword, 'class');
    const name = consume(TokenType.Identifier).value;
    let base: string | undefined;
    if (!atEnd() && peek().value === ':') {
      consume(TokenType.Punctuation, ':');
      base = consume(TokenType.Identifier).value;
    }
    consume(TokenType.Punctuation, '{');
    skipBlock();
    if (!atEnd() && peek().value === ';') {
      consume(TokenType.Punctuation, ';');
    }
    return { type: 'ClassDeclaration', name, base };
  }

  while (!atEnd()) {
    const token = peek();
    if (token.type === TokenType.Keyword && token.value === 'enum') {
      declarations.push(parseEnum());
    } else if (token.type === TokenType.Keyword && token.value === 'class') {
      declarations.push(parseClass());
    } else {
      pos++;
    }
  }

  return declarations;
}

