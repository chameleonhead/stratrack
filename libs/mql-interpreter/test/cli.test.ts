import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { readTextFile } from "../src/cli";

const code = "int start(){return 0;}";

function makeTempFile(buf: Buffer) {
  const dir = mkdtempSync(join(tmpdir(), "mqli-"));
  const file = join(dir, "code.mq4");
  writeFileSync(file, buf);
  return file;
}

test("reads UTF-16 LE", () => {
  const buf = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(code, "utf16le")]);
  const file = makeTempFile(buf);
  expect(readTextFile(file)).toBe(code);
});

test("reads UTF-16 BE", () => {
  const le = Buffer.from(code, "utf16le");
  for (let i = 0; i < le.length; i += 2) {
    const a = le[i];
    le[i] = le[i + 1];
    le[i + 1] = a;
  }
  const buf = Buffer.concat([Buffer.from([0xfe, 0xff]), le]);
  const file = makeTempFile(buf);
  expect(readTextFile(file)).toBe(code);
});
