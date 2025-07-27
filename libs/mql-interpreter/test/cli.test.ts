import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { spawnSync, execSync } from 'child_process';

const libDir = path.resolve(__dirname, '..');
const bin = path.join(libDir, 'bin', 'mql-interpreter.js');

describe('CLI backtest', () => {
  it('runs backtest and stores globals', () => {
    execSync('npm run build --silent', { cwd: libDir });
    const dir = mkdtempSync(path.join(tmpdir(), 'mt4-'));
    const codePath = path.join(dir, 'test.mq4');
    const csvPath = path.join(dir, 'data.csv');
    writeFileSync(codePath, 'string name="x"; void OnTick(){ GlobalVariableSet(name, GlobalVariableGet(name)+1); }');
    writeFileSync(csvPath, '1,1,1,1,1\n2,2,2,2,2\n3,3,3,3,3\n');
    const res = spawnSync('node', [bin, codePath, '--backtest', csvPath, '--data-dir', dir], { encoding: 'utf8' });
    const out = JSON.parse(res.stdout.trim());
    expect(out.Bars).toBe(3);
    const gv = JSON.parse(readFileSync(path.join(dir, 'MQL4', 'Files', 'globals.json'), 'utf8'));
    expect(gv.x.value).toBe(3);
  });

  it('outputs html when requested', () => {
    execSync('npm run build --silent', { cwd: libDir });
    const dir = mkdtempSync(path.join(tmpdir(), 'mt4-'));
    const codePath = path.join(dir, 'test.mq4');
    const csvPath = path.join(dir, 'data.csv');
    writeFileSync(codePath, 'void OnTick(){Print("ok");}');
    writeFileSync(csvPath, '1,1,1,1,1\n');
    const res = spawnSync('node', [bin, codePath, '--backtest', csvPath, '--format', 'html'], { encoding: 'utf8' });
    expect(res.stdout.includes('<!doctype html>')).toBe(true);
  });
});
