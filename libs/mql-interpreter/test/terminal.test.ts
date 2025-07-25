import { describe, it, expect } from 'vitest';
import { VirtualTerminal } from '../src/terminal';

describe('VirtualTerminal', () => {
  it('can write and read files in memory', () => {
    const term = new VirtualTerminal();
    const handle = term.open('test.txt', 'w');
    term.write(handle, 'hello');
    term.close(handle);
    const h2 = term.open('test.txt', 'r');
    const data = term.read(h2);
    expect(data).toBe('hello');
  });

  it('manages global variables', () => {
    const term = new VirtualTerminal();
    term.setGlobalVariable('x', 5);
    expect(term.getGlobalVariable('x')).toBe(5);
    expect(term.checkGlobalVariable('x')).toBe(true);
    expect(term.globalVariablesTotal()).toBe(1);
    const t = term.getGlobalVariableTime('x');
    expect(t).toBeGreaterThan(0);
    expect(term.setGlobalVariableOnCondition('x', 6, 5)).toBe(true);
    expect(term.getGlobalVariable('x')).toBe(6);
    expect(term.setGlobalVariableOnCondition('x', 7, 5)).toBe(false);
    expect(term.deleteGlobalVariable('x')).toBe(true);
    expect(term.globalVariablesTotal()).toBe(0);
  });
});
