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
  'input',
  'extern',
  'const',
  'public',
  'private',
  'protected',
  'virtual',
  'enum',
  'class',
  'struct',
  'operator',
  'template',
  'typename',
  'strict',
  'true',
  'false',
  'sizeof',
  'const_cast',
  'dynamic_cast',
  'reinterpret_cast',
  'static_cast',
]);

// Supported operator tokens. Order matters so longer tokens are matched first.
const operators = [
  '>>=',
  '<<=',
  '++',
  '--',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '^=',
  '&=',
  '|=',
  '==',
  '!=',
  '<=',
  '>=',
  '&&',
  '||',
  '<<',
  '>>',
  '->',
  '+',
  '-',
  '*',
  '/',
  '%',
  '=',
  '>',
  '<',
  '!',
  '&',
  '|',
  '^',
  '~',
  '?',
];
const operatorStart = new Set(operators.map((op) => op[0]));
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
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        i++;
      }
      if (i >= source.length) {
        throw new Error('Unterminated comment');
      }
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
      if (value.length > 63) {
        throw new Error('Identifier too long');
      }
      tokens.push({
        type: keywords.has(value) ? TokenType.Keyword : TokenType.Identifier,
        value,
      });
      continue;
    }
    // operator
    if (operatorStart.has(char)) {
      let matched: string | undefined;
      for (const op of operators) {
        if (source.startsWith(op, i)) {
          matched = op;
          break;
        }
      }
      if (matched) {
        tokens.push({ type: TokenType.Operator, value: matched });
        i += matched.length;
        continue;
      }
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
