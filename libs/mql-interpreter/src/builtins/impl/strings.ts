import type { BuiltinFunction } from '../types';

export const StringTrimLeft: BuiltinFunction = (str: { value: string }) => {
  str.value = str.value.replace(/^\s+/, '');
  return str.value.length;
};

export const StringTrimRight: BuiltinFunction = (str: { value: string }) => {
  str.value = str.value.replace(/\s+$/, '');
  return str.value.length;
};

export const StringLen: BuiltinFunction = (s: string) => s.length;

export const StringSubstr: BuiltinFunction = (
  s: string,
  start: number,
  len?: number,
) => s.substr(start, len);

export const StringAdd: BuiltinFunction = (
  str: { value: string },
  add: string,
) => {
  str.value += add;
  return true;
};

export const StringBufferLen: BuiltinFunction = (s: string) => s.length;

export const StringCompare: BuiltinFunction = (
  s1: string,
  s2: string,
  caseSensitive = true,
) => {
  if (!caseSensitive) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  }
  if (s1 < s2) return -1;
  if (s1 > s2) return 1;
  return 0;
};

export const StringConcatenate: BuiltinFunction = (...args: any[]) =>
  args.map((a) => String(a)).join('');

export const StringFill: BuiltinFunction = (
  str: { value: string },
  ch: number,
) => {
  const char = String.fromCharCode(ch);
  str.value = char.repeat(str.value.length);
  return true;
};

export const StringFind: BuiltinFunction = (
  str: string,
  substr: string,
  start = 0,
) => str.indexOf(substr, start);

export const StringGetChar: BuiltinFunction = (str: string, pos: number) => {
  if (pos < 0 || pos >= str.length) return -1;
  return str.charCodeAt(pos);
};

export const StringSetChar: BuiltinFunction = (
  str: { value: string },
  pos: number,
  ch: number,
) => {
  if (pos < 0 || pos >= str.value.length) return false;
  str.value =
    str.value.substring(0, pos) +
    String.fromCharCode(ch) +
    str.value.substring(pos + 1);
  return true;
};

export const StringInit: BuiltinFunction = (
  str: { value: string },
  len: number,
  ch: number = 0,
) => {
  const char = String.fromCharCode(ch);
  str.value = char.repeat(len);
  return true;
};

export const StringReplace: BuiltinFunction = (
  str: { value: string },
  find: string,
  replace: string,
) => {
  if (!find) return -1;
  let count = 0;
  let idx = str.value.indexOf(find);
  while (idx !== -1) {
    count++;
    idx = str.value.indexOf(find, idx + find.length);
  }
  str.value = str.value.split(find).join(replace);
  return count;
};

export const StringSplit: BuiltinFunction = (
  value: string,
  separator: number,
  result: string[] = [],
) => {
  if (value == null) return -1;
  const parts = value.split(String.fromCharCode(separator));
  result.length = 0;
  for (const p of parts) result.push(p);
  return result.length;
};

export const StringToLower: BuiltinFunction = (s: string) => s.toLowerCase();
export const StringToUpper: BuiltinFunction = (s: string) => s.toUpperCase();

// aliases for compatibility
export const StringGetCharacter = StringGetChar;
export const StringSetCharacter = StringSetChar;
