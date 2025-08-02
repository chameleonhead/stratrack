import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { describe, it, expect, beforeAll } from "vitest";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const cli = join(root, "bin", "mql-interpreter.js");

describe("cli warnings", () => {
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
  });
});
