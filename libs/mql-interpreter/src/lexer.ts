export enum TokenType {
  Keyword = 'Keyword',
  Identifier = 'Identifier',
  Number = 'Number',
  String = 'String',
  Operator = 'Operator',
  Punctuation = 'Punctuation',
}

export interface Token {
  type: TokenType;
  value: string;
}

// Common MQL built-in keywords. The list is based on the MQL5 documentation at
// https://www.mql5.com/ja/docs/basis/types and is not exhaustive but covers
// the primitive types and a few basic statements.
const keywords = new Set([
  'void',
  'bool',
  'char',
  'uchar',
  'short',
  'ushort',
  'int',
  'uint',
  'long',
  'ulong',
  'float',
  'double',
  'color',
  'datetime',
  'string',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'default',
  'break',
  'continue',
  'return',
  'new',
  'delete',
  'this',
  'static',
  'const',
  'public',
  'private',
  'protected',
  'virtual',
  'enum',
  'class',
  'struct',
  'operator',
]);

const operatorChars = new Set(['+', '-', '*', '/', '=', '>', '<', '!', '&', '|']);
const punctuationChars = new Set(['(', ')', '{', '}', '[', ']', ';', ',', '.', ':']);

export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const char = source[i];
    // skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    // single line comment
    if (char === '/' && source[i + 1] === '/') {
      i += 2;
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }
    // multi line comment
    if (char === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // string literal
    if (char === '"') {
      let value = '';
      i++; // skip opening quote
      while (i < source.length && source[i] !== '"') {
        // rudimentary escape handling
        if (source[i] === '\\') {
          value += source[i];
          i++;
        }
        value += source[i++];
      }
      i++; // skip closing quote
      tokens.push({ type: TokenType.String, value });
      continue;
    }
    // number literal
    if (/\d/.test(char)) {
      let value = '';
      while (i < source.length && /[0-9.]/.test(source[i])) {
        value += source[i++];
      }
      tokens.push({ type: TokenType.Number, value });
      continue;
    }
    // identifier or keyword
    if (/[A-Za-z_]/.test(char)) {
      let value = '';
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) {
        value += source[i++];
      }
      tokens.push({
        type: keywords.has(value) ? TokenType.Keyword : TokenType.Identifier,
        value,
      });
      continue;
    }
    // operator
    if (operatorChars.has(char)) {
      let value = char;
      i++;
      // handle two-char operators like ==, !=, <=, >=, &&, ||
      if (operatorChars.has(source[i])) {
        const two = value + source[i];
        if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) {
          value = two;
          i++;
        }
      }
      tokens.push({ type: TokenType.Operator, value });
      continue;
    }
    // punctuation
    if (punctuationChars.has(char)) {
      tokens.push({ type: TokenType.Punctuation, value: char });
      i++;
      continue;
    }
    // unknown char
    throw new Error(`Unexpected character: ${char}`);
  }
  return tokens;
}
