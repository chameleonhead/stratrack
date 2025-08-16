import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { getWarnings } from "../dist/src/compiler/warnings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const readmePath = resolve(__dirname, "../README.md");
const start = "<!-- WARNING_CODES_START -->";
const end = "<!-- WARNING_CODES_END -->";

const warnings = getWarnings();
const list = warnings.map((w) => `- \`${w.code}\` – ${w.description}`).join("\n");

const args = process.argv.slice(2);
const check = args.includes("--check");

const current = readFileSync(readmePath, "utf8");
const startIdx = current.indexOf(start);
const endIdx = current.indexOf(end);
if (startIdx === -1 || endIdx === -1) {
  throw new Error("Warning code markers not found in README.md");
}
const before = current.slice(0, startIdx + start.length);
const after = current.slice(endIdx);
const updated = `${before}\n\n${list}\n${after}`;

if (check) {
  if (updated !== current) {
    console.error("Warning documentation is out of date. Run npm run update-warning-docs.");
    process.exit(1);
  }
} else {
  writeFileSync(readmePath, updated);
}
