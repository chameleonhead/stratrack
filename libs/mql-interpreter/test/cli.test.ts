import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeAll } from "vitest";
import { readTextFile } from "../src/cli";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const cli = join(root, "dist", "cli.cjs");

describe("dev:cli", () => {
  it("runs backtest command without building", () => {
    const codeFile = join(tmpdir(), "devbt.mq4");
    writeFileSync(codeFile, "int OnTick(){return 0;}");
    const csvFile = join(tmpdir(), "devdata.csv");
    writeFileSync(csvFile, "0,1,1,1,1\n1,1,1,1,1");
    const result = spawnSync("npx", ["tsx", "src/cli.ts", "backtest", codeFile, csvFile], {
      cwd: root,
    });
    expect(result.status).toBe(0);
    expect(result.stdout.toString()).toContain("globals");
  });
});

describe("cli", () => {
  beforeAll(() => {
    const build = spawnSync("npm", ["run", "build"], { cwd: root });
    if (build.status !== 0) {
      throw new Error(`${build.stderr}`);
    }
  });

  it("runs check command", () => {
    const file = join(tmpdir(), "sample.mq4");
    writeFileSync(file, "int start(){return 0;}");
    const result = spawnSync("node", [cli, "check", file], { cwd: root });
    expect(result.status).toBe(0);
    expect(result.stdout.toString()).toContain("Checking:");
  });

  it("runs backtest command", () => {
    const codeFile = join(tmpdir(), "bt.mq4");
    writeFileSync(codeFile, "int OnTick(){return 0;}");
    const csvFile = join(tmpdir(), "data.csv");
    writeFileSync(csvFile, "0,1,1,1,1\n1,1,1,1,1");
    const result = spawnSync(
      "node",
      [
        cli,
        "backtest",
        codeFile,
        "--candles",
        csvFile,
        "--balance",
        "5000",
        "--margin",
        "1000",
        "--currency",
        "JPY",
      ],
      { cwd: root }
    );
    expect(result.status).toBe(0);
    expect(result.stdout.toString()).toContain("globals");
  });

  const code = "int start(){return 0;}";

  function makeTempFile(buf: Buffer) {
    const dir = mkdtempSync(join(tmpdir(), "mqli-"));
    const file = join(dir, "code.mq4");
    writeFileSync(file, buf);
    return file;
  }

  it("reads UTF-16 LE", () => {
    const buf = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(code, "utf16le")]);
    const file = makeTempFile(buf);
    expect(readTextFile(file)).toBe(code);
  });
});
