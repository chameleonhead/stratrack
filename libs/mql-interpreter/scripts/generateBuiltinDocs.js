import { writeFileSync } from "fs";
import { resolve } from "path";
import { builtinSignatures } from "../dist/src/parser/builtins/signatures.js";

const header =
  "# Builtin Signatures\n\n" +
  "Generated from src/parser/builtins/signatures.ts. Do not edit.\n\n";

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
const outIndex = args.indexOf("--out");
if (outIndex !== -1 && args[outIndex + 1]) {
  const outPath = resolve(process.cwd(), args[outIndex + 1]);
  writeFileSync(outPath, output);
} else {
  process.stdout.write(output);
}
