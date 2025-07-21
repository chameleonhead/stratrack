export interface MacroMap {
  [name: string]: string;
}

export interface PropertyMap {
  [name: string]: string[];
}

export interface PreprocessResult {
  tokens: Token[];
  properties: PropertyMap;
}

export interface PreprocessOptions {
  /**
   * Optional callback that returns the contents of an imported file.
   * If undefined or the file is missing, an error is thrown.
   */
  fileProvider?: (path: string) => string | undefined;
}

import { lex, Token, TokenType } from './lexer';

/**
 * Preprocess the given source code, handling simple #define and #undef
 * directives. Only parameterless macros are supported. The resulting token
 * stream has all identifiers substituted with their macro values.
 */
export function preprocessWithProperties(
  source: string,
  options: PreprocessOptions = {}
): PreprocessResult {
  const macros: MacroMap = {};
  const properties: PropertyMap = {};
  const lines = source.split(/\r?\n/);
  let codeLines: string[] = [];
  const result: Token[] = [];
  const condStack: Array<{
    parentActive: boolean;
    condition: boolean;
    active: boolean;
    elseSeen: boolean;
  }> = [];

  const isActive = () =>
    condStack.length === 0 ? true : condStack[condStack.length - 1].active;

  const flush = () => {
    if (codeLines.length === 0) return;
    const tokens = lex(codeLines.join('\n'));
    for (const token of tokens) {
      if (token.type === TokenType.Identifier && macros[token.value] !== undefined) {
        const expansion = lex(macros[token.value]);
        result.push(...expansion);
      } else {
        result.push(token);
      }
    }
    codeLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#ifdef')) {
      flush();
      const id = trimmed.slice('#ifdef'.length).trim().split(/\s+/)[0];
      const parentActive = isActive();
      const cond = macros[id] !== undefined;
      condStack.push({
        parentActive,
        condition: cond,
        active: parentActive && cond,
        elseSeen: false,
      });
      continue;
    }
    if (trimmed.startsWith('#ifndef')) {
      flush();
      const id = trimmed.slice('#ifndef'.length).trim().split(/\s+/)[0];
      const parentActive = isActive();
      const cond = macros[id] === undefined;
      condStack.push({
        parentActive,
        condition: cond,
        active: parentActive && cond,
        elseSeen: false,
      });
      continue;
    }
    if (trimmed.startsWith('#else')) {
      flush();
      const state = condStack[condStack.length - 1];
      if (!state) throw new Error('#else without #ifdef');
      if (state.elseSeen) throw new Error('multiple #else');
      state.active = state.parentActive && !state.condition;
      state.elseSeen = true;
      continue;
    }
    if (trimmed.startsWith('#endif')) {
      flush();
      if (!condStack.pop()) throw new Error('#endif without #ifdef');
      continue;
    }
    if (!isActive()) {
      continue;
    }
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
    if (trimmed.startsWith('#property')) {
      const rest = trimmed.slice('#property'.length).trim();
      const [name, ...valueParts] = rest.split(/\s+/);
      if (name) {
        if (!properties[name]) properties[name] = [];
        properties[name].push(valueParts.join(' '));
      }
      continue;
    }
    if (trimmed.startsWith('#import')) {
      flush();
      const rest = trimmed.slice('#import'.length).trim();
      if (rest) {
        const path = rest.replace(/^["<]|[">]$/g, '');
        const content = options.fileProvider?.(path);
        if (content === undefined) {
          throw new Error(`Imported file not provided: ${path}`);
        }
        const imported = preprocessWithProperties(content, options);
        // merge properties from the imported file
        for (const key in imported.properties) {
          if (!properties[key]) properties[key] = [];
          properties[key].push(...imported.properties[key]);
        }
        result.push(...imported.tokens);
      }
      continue;
    }
    codeLines.push(line);
  }

  flush();

  return { tokens: result, properties };
}

export function preprocess(source: string, options: PreprocessOptions = {}): Token[] {
  return preprocessWithProperties(source, options).tokens;
}
