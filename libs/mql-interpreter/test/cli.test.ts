import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeAll } from "vitest";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const cli = join(root, "dist", "cli.cjs");

describe("cli", () => {
  beforeAll(() => {
    const build = spawnSync("npm", ["run", "build"], { cwd: root });
    if (build.status !== 0) {
      throw new Error(build.stderr.toString());
    }
  });

  it("runs check command", () => {
    const file = join(tmpdir(), "sample.mq4");
    writeFileSync(file, "int start(){return 0;}");
    const result = spawnSync("node", [cli, "check", file], { cwd: root });
    expect(result.status).toBe(0);
    expect(result.stdout.toString()).toContain("Checking:");
  });
});
