import {
  Print,
  Alert,
  Comment,
  PrintFormat,
  GetTickCount,
  GetTickCount64,
  GetMicrosecondCount,
  Sleep,
  PlaySound,
  SendMail,
  SendNotification,
  SendFTP,
  TerminalClose,
  ExpertRemove,
  DebugBreak,
  MessageBox,
} from '../../src/builtins/impl/common';
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

  it('new helpers return default values', () => {
    expect(typeof GetTickCount64()).toBe('bigint');
    expect(GetMicrosecondCount()).toBeTypeOf('number');
    expect(PlaySound('a.wav')).toBe(true);
    expect(SendMail('a', 'b', 'c')).toBe(true);
    expect(SendNotification('n')).toBe(true);
    expect(SendFTP('f', 'ftp')).toBe(true);
    expect(TerminalClose()).toBe(true);
    expect(ExpertRemove()).toBe(true);
    expect(DebugBreak()).toBe(0);
    expect(MessageBox('text')).toBe(1);
  });

});
