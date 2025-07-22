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
  line: number;
  column: number;
}

export interface LexError {
  message: string;
  line: number;
  column: number;
}

export interface LexResult {
  tokens: Token[];
  errors: LexError[];
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
  'abstract',
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

export function lex(source: string): LexResult {
  const tokens: Token[] = [];
  const errors: LexError[] = [];
  let i = 0;
  let line = 1;
  let column = 1;

  const advance = (n: number = 1) => {
    while (n-- > 0) {
      if (source[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
      i++;
    }
  };

  while (i < source.length) {
    const char = source[i];
    // skip whitespace
    if (/\s/.test(char)) {
      advance();
      continue;
    }
    // single line comment
    if (char === '/' && source[i + 1] === '/') {
      advance(2);
      while (i < source.length && source[i] !== '\n') advance();
      continue;
    }
    // multi line comment
    if (char === '/' && source[i + 1] === '*') {
      advance(2);
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        advance();
      }
      if (i >= source.length) {
        errors.push({ message: 'Unterminated comment', line, column });
        break;
      }
      advance(2);
      continue;
    }
    // string literal
    if (char === '"') {
      let value = '';
      const startLine = line;
      const startCol = column;
      advance(); // skip opening quote
      while (i < source.length && source[i] !== '"') {
        // rudimentary escape handling
        if (source[i] === '\\') {
          value += source[i];
          advance();
        }
        value += source[i];
        advance();
      }
      advance(); // skip closing quote
      tokens.push({ type: TokenType.String, value, line: startLine, column: startCol });
      continue;
    }
    // number literal
    if (/\d/.test(char)) {
      let value = '';
      const startLine = line;
      const startCol = column;
      while (i < source.length && /[0-9.]/.test(source[i])) {
        value += source[i];
        advance();
      }
      tokens.push({ type: TokenType.Number, value, line: startLine, column: startCol });
      continue;
    }
    // identifier or keyword
    if (/[A-Za-z_]/.test(char)) {
      let value = '';
      const startLine = line;
      const startCol = column;
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) {
        value += source[i];
        advance();
      }
      if (value.length > 63) {
        errors.push({ message: 'Identifier too long', line: startLine, column: startCol });
      }
      tokens.push({
        type: keywords.has(value) ? TokenType.Keyword : TokenType.Identifier,
        value,
        line: startLine,
        column: startCol,
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
        tokens.push({ type: TokenType.Operator, value: matched, line, column });
        advance(matched.length);
        continue;
      }
    }
    // punctuation
    if (punctuationChars.has(char)) {
      tokens.push({ type: TokenType.Punctuation, value: char, line, column });
      advance();
      continue;
    }
    // unknown char
    errors.push({ message: `Unexpected character: ${char}`, line, column });
    advance();
  }
  return { tokens, errors };
}
