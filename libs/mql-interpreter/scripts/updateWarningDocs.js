import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { getWarnings } from "../dist/warnings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const readmePath = resolve(__dirname, "../README.md");
const start = "<!-- WARNING_CODES_START -->";
const end = "<!-- WARNING_CODES_END -->";

const warnings = getWarnings();
const list = warnings.map((w) => `- \`${w.code}\` – ${w.description}`).join("\n");

let readme = readFileSync(readmePath, "utf8");
const startIdx = readme.indexOf(start);
const endIdx = readme.indexOf(end);
if (startIdx === -1 || endIdx === -1) {
  throw new Error("Warning code markers not found in README.md");
}
const before = readme.slice(0, startIdx + start.length);
const after = readme.slice(endIdx);
readme = `${before}\n${list}\n${after}`;
writeFileSync(readmePath, readme);
