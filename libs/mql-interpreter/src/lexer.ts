export enum TokenType {
  Keyword = "Keyword",
  Identifier = "Identifier",
  Number = "Number",
  String = "String",
  Operator = "Operator",
  Punctuation = "Punctuation",
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
  "void",
  "bool",
  "char",
  "uchar",
  "short",
  "ushort",
  "int",
  "uint",
  "long",
  "ulong",
  "float",
  "double",
  "color",
  "datetime",
  "string",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "default",
  "break",
  "continue",
  "return",
  "new",
  "delete",
  "this",
  "static",
  "input",
  "extern",
  "const",
  "public",
  "private",
  "protected",
  "virtual",
  "abstract",
  "enum",
  "class",
  "struct",
  "operator",
  "template",
  "typename",
  "strict",
  "true",
  "false",
  "sizeof",
  "const_cast",
  "dynamic_cast",
  "reinterpret_cast",
  "static_cast",
]);

// Supported operator tokens. Order matters so longer tokens are matched first.
const operators = [
  ">>=",
  "<<=",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "^=",
  "&=",
  "|=",
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "<<",
  ">>",
  "->",
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  ">",
  "<",
  "!",
  "&",
  "|",
  "^",
  "~",
  "?",
];
const operatorStart = new Set(operators.map((op) => op[0]));
const punctuationChars = new Set(["(", ")", "{", "}", "[", "]", ";", ",", ".", ":"]);

export function lex(source: string): LexResult {
  const tokens: Token[] = [];
  const errors: LexError[] = [];
  let i = 0;
  let line = 1;
  let column = 1;

  const advance = (n: number = 1) => {
    while (n-- > 0) {
      if (source[i] === "\n") {
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
    if (char === "/" && source[i + 1] === "/") {
      advance(2);
      while (i < source.length && source[i] !== "\n") advance();
      continue;
    }
    // multi line comment
    if (char === "/" && source[i + 1] === "*") {
      advance(2);
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
        advance();
      }
      if (i >= source.length) {
        errors.push({ message: "Unterminated comment", line, column });
        break;
      }
      advance(2);
      continue;
    }
    // string literal
    if (char === '"') {
      let value = "";
      const startLine = line;
      const startCol = column;
      advance(); // skip opening quote
      while (i < source.length && source[i] !== '"') {
        // rudimentary escape handling
        if (source[i] === "\\") {
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
    // character constant
    if (char === "'") {
      const startLine = line;
      const startCol = column;
      advance();
      let val: number | null = null;
      if (source[i] === "\\") {
        advance();
        const esc = source[i];
        advance();
        switch (esc) {
          case "n":
            val = 10;
            break;
          case "t":
            val = 9;
            break;
          case "r":
            val = 13;
            break;
          case "\\":
            val = 92;
            break;
          case "'":
            val = 39;
            break;
          case '"':
            val = 34;
            break;
          case "x": {
            let hex = "";
            while (i < source.length && /[0-9a-fA-F]/.test(source[i])) {
              hex += source[i];
              advance();
            }
            val = parseInt(hex || "0", 16);
            break;
          }
          default: {
            let digits = esc;
            while (i < source.length && /[0-9]/.test(source[i])) {
              digits += source[i];
              advance();
            }
            if (/^[0-9]+$/.test(digits)) val = parseInt(digits, 10);
            else val = digits.charCodeAt(0);
          }
        }
      } else {
        val = source.charCodeAt(i);
        advance();
      }
      if (source[i] === "'") advance();
      else
        errors.push({ message: "Unterminated char constant", line: startLine, column: startCol });
      tokens.push({
        type: TokenType.Number,
        value: String(val ?? 0),
        line: startLine,
        column: startCol,
      });
      continue;
    }
    // color literal C'..'
    if ((char === "C" || char === "c") && source[i + 1] === "'") {
      const startLine = line;
      const startCol = column;
      advance(2); // skip C'
      let inner = "";
      while (i < source.length && source[i] !== "'") {
        inner += source[i];
        advance();
      }
      if (source[i] === "'") advance();
      const parts = inner.split(",").map((s) => s.trim());
      const parseComp = (s: string) =>
        s.startsWith("0x") || s.startsWith("0X") ? parseInt(s, 16) : parseInt(s, 10);
      const r = parseComp(parts[0] || "0");
      const g = parseComp(parts[1] || "0");
      const b = parseComp(parts[2] || "0");
      const val = r + (g << 8) + (b << 16);
      tokens.push({
        type: TokenType.Number,
        value: String(val),
        line: startLine,
        column: startCol,
      });
      continue;
    }
    // datetime literal D'..'
    if ((char === "D" || char === "d") && source[i + 1] === "'") {
      const startLine = line;
      const startCol = column;
      advance(2);
      let inner = "";
      while (i < source.length && source[i] !== "'") {
        inner += source[i];
        advance();
      }
      if (source[i] === "'") advance();
      let val = 0;
      const re1 = /^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\s+(\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?$/;
      const re2 = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?$/;
      let m = inner.match(re1);
      if (!m) m = inner.match(re2);
      if (m) {
        const year = parseInt(m[1]);
        const month = parseInt(m[2]);
        const day = parseInt(m[3]);
        const hour = parseInt(m[4] || "0");
        const min = parseInt(m[5] || "0");
        const sec = parseInt(m[6] || "0");
        val = Math.floor(Date.UTC(year, month - 1, day, hour, min, sec) / 1000);
      }
      tokens.push({
        type: TokenType.Number,
        value: String(val),
        line: startLine,
        column: startCol,
      });
      continue;
    }
    // number literal
    if (/\d/.test(char) || (char === "." && /\d/.test(source[i + 1]))) {
      let value = "";
      const startLine = line;
      const startCol = column;
      if (char === "0" && (source[i + 1] === "x" || source[i + 1] === "X")) {
        value += "0";
        advance();
        value += source[i];
        advance();
        while (i < source.length && /[0-9a-fA-F]/.test(source[i])) {
          value += source[i];
          advance();
        }
      } else {
        while (i < source.length && /[0-9]/.test(source[i])) {
          value += source[i];
          advance();
        }
        if (i < source.length && source[i] === ".") {
          value += ".";
          advance();
          while (i < source.length && /[0-9]/.test(source[i])) {
            value += source[i];
            advance();
          }
        }
        if (i < source.length && /[eE]/.test(source[i])) {
          value += source[i];
          advance();
          if (source[i] === "+" || source[i] === "-") {
            value += source[i];
            advance();
          }
          while (i < source.length && /[0-9]/.test(source[i])) {
            value += source[i];
            advance();
          }
        }
      }
      tokens.push({ type: TokenType.Number, value, line: startLine, column: startCol });
      continue;
    }
    // identifier or keyword
    if (/[A-Za-z_]/.test(char)) {
      let value = "";
      const startLine = line;
      const startCol = column;
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) {
        value += source[i];
        advance();
      }
      if (value.length > 63) {
        errors.push({ message: "Identifier too long", line: startLine, column: startCol });
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
