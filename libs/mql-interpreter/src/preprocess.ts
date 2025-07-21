export interface MacroMap {
  [name: string]: string;
}

import { lex, Token, TokenType } from './lexer';

/**
 * Preprocess the given source code, handling simple #define and #undef
 * directives. Only parameterless macros are supported. The resulting token
 * stream has all identifiers substituted with their macro values.
 */
export function preprocess(source: string): Token[] {
  const macros: MacroMap = {};
  const lines = source.split(/\r?\n/);
  const codeLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#define')) {
      const rest = trimmed.slice('#define'.length).trim();
      const [id, ...exprParts] = rest.split(/\s+/);
      if (id) macros[id] = exprParts.join(' ');
      continue;
    }
    if (trimmed.startsWith('#undef')) {
      const id = trimmed.slice('#undef'.length).trim().split(/\s+/)[0];
      delete macros[id];
      continue;
    }
    codeLines.push(line);
  }

  const tokens = lex(codeLines.join('\n'));
  const result: Token[] = [];

  for (const token of tokens) {
    if (token.type === TokenType.Identifier && macros[token.value] !== undefined) {
      const expansion = lex(macros[token.value]);
      result.push(...expansion);
    } else {
      result.push(token);
    }
  }

  return result;
}
