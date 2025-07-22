export interface Macro {
  body: string;
  params?: string[];
}

export interface MacroMap {
  [name: string]: Macro;
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

function expandTokens(tokens: Token[], macros: MacroMap): Token[] {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const macro =
      tok.type === TokenType.Identifier ? macros[tok.value] : undefined;
    if (!macro) {
      out.push(tok);
      continue;
    }
    if (!macro.params) {
      out.push(...expandTokens(lex(macro.body), macros));
      continue;
    }
    if (tokens[i + 1]?.value !== '(') {
      out.push(tok);
      continue;
    }
    i += 2; // skip name and '('
    const args: Token[][] = [];
    let current: Token[] = [];
    let depth = 0;
    for (; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.value === '(') {
        depth++;
        current.push(t);
        continue;
      }
      if (t.value === ')' && depth === 0) {
        args.push(current);
        break;
      }
      if (t.value === ')' && depth > 0) {
        depth--;
        current.push(t);
        continue;
      }
      if (t.value === ',' && depth === 0) {
        args.push(current);
        current = [];
        continue;
      }
      current.push(t);
    }
    const argStrings = args.map((a) => a.map((t) => t.value).join(' '));
    let body = macro.body;
    macro.params.forEach((p, idx) => {
      const re = new RegExp(`\\b${p}\\b`, 'g');
      body = body.replace(re, argStrings[idx] ?? '');
    });
    out.push(...expandTokens(lex(body), macros));
  }
  return out;
}

/**
 * Preprocess the given source code, handling #define/#undef directives.
 * Both parameterless and parameterized macros are expanded in the resulting
 * token stream.
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
    result.push(...expandTokens(tokens, macros));
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
      const m = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)(\(([^)]*)\))?\s*(.*)$/);
      if (m) {
        const id = m[1];
        const params = m[3]
          ? m[3]
              .split(',')
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
          : undefined;
        const body = m[4] ?? '';
        macros[id] = { body, params };
      }
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
