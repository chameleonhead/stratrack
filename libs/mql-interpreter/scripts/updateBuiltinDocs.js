import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { builtinSignatures } from "../dist/builtins/signatures.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docPath = resolve(__dirname, "../BUILTIN_SIGNATURES.md");
const header =
  "# Builtin Signatures\n\n" +
  "This file is auto-generated from src/builtins/signatures.ts. Do not edit.\n\n";

function formatSignature(sig) {
  const params = sig.parameters.map((p) => (p.optional ? `[${p.type}]` : p.type));
  if (sig.variadic) params.push("...");
  return `(${params.join(", ")})`;
}

const lines = Object.keys(builtinSignatures)
  .sort()
  .map((name) => {
    const sig = builtinSignatures[name];
    const sigs = Array.isArray(sig) ? sig : [sig];
    const formatted = sigs.map((s) => formatSignature(s)).join(" | ");
    return `- \`${name}${formatted}\``;
  })
  .join("\n");

const output = `${header}${lines}\n`;

const args = process.argv.slice(2);
const check = args.includes("--check");

if (check) {
  const current = readFileSync(docPath, "utf8");
  if (current !== output) {
    console.error(
      "Builtin signature documentation is out of date. Run npm run update-builtin-docs."
    );
    process.exit(1);
  }
} else {
  writeFileSync(docPath, output);
}
