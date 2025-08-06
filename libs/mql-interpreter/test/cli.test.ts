import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { describe, it, expect, beforeAll } from "vitest";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const cli = join(root, "bin", "mql-interpreter.js");

describe("cli options", () => {
  beforeAll(() => {
    const build = spawnSync("npm", ["run", "build"], { cwd: root });
    if (build.status !== 0) {
      throw new Error(build.stderr.toString());
    }
  });

  it("can treat warnings as errors", () => {
    const src = `
      class A { void foo(){} };
      class B : A { void foo(){} };
    `;
    const file = join(tmpdir(), "warn.mq4");
    writeFileSync(file, src);
    const normal = spawnSync("node", [cli, file], { cwd: root });
    expect(normal.status).toBe(0);
    const strict = spawnSync("node", [cli, file, "--warnings-as-errors"], { cwd: root });
    expect(strict.status).toBe(1);
    const suppressed = spawnSync(
      "node",
      [cli, file, "--warnings-as-errors", "--suppress-warning", "override-non-virtual"],
      { cwd: root }
    );
    expect(suppressed.status).toBe(0);
  });

  it("lists available warning codes", () => {
    const result = spawnSync("node", [cli, "--list-warnings"], { cwd: root });
    expect(result.status).toBe(0);
    const lines = result.stdout.toString().trim().split("\n");
    expect(lines.some((l) => l.startsWith("override-non-virtual"))).toBe(true);
    expect(lines.some((l) => l.startsWith("override-missing"))).toBe(true);
  });

  it("lists builtin signatures", () => {
    const result = spawnSync("node", [cli, "--list-builtins"], { cwd: root });
    expect(result.status).toBe(0);
    const lines = result.stdout.toString().trim().split("\n");
    expect(lines.some((l) => l.startsWith("Print("))).toBe(true);
    expect(lines.some((l) => l.startsWith("ArrayResize("))).toBe(true);
  });
});
