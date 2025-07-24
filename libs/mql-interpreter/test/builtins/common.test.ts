import { Print, Alert, Comment, PrintFormat, GetTickCount, Sleep } from '../../src/builtins/impl/common';
import { describe, it, expect } from 'vitest';

describe('common builtins', () => {
  it('Print and Comment output and return 0', () => {
    expect(Print('a')).toBe(0);
    expect(Comment('b')).toBe(0);
  });

  it('Alert returns true', () => {
    expect(Alert('x')).toBe(true);
  });

  it('PrintFormat formats strings', () => {
    expect(PrintFormat('num %d', 5)).toBe(0);
  });

  it('GetTickCount returns increasing time', async () => {
    const a = GetTickCount();
    await new Promise(r => setTimeout(r, 10));
    const b = GetTickCount();
    expect(b >= a).toBe(true);
  });

  it('Sleep waits at least specified time', () => {
    const start = Date.now();
    Sleep(10);
    expect(Date.now() - start >= 10).toBe(true);
  });
});
