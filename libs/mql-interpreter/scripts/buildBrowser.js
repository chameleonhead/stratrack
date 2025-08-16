import esbuild from "esbuild";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const terminalStubPlugin = {
  name: "terminal-stub",
  setup(build) {
    build.onResolve({ filter: /terminal\.js$/ }, () => ({
      path: "terminal-stub",
      namespace: "terminal-stub",
    }));
    build.onLoad({ filter: /.*/, namespace: "terminal-stub" }, () => ({
      contents: "export class VirtualTerminal {}\n",
      loader: "js",
    }));
  },
};

await esbuild.build({
  entryPoints: [join(__dirname, "..", "src", "index.ts")],
  bundle: true,
  format: "esm",
  platform: "browser",
  sourcemap: true,
  outfile: join(__dirname, "..", "dist", "index.browser.js"),
  plugins: [terminalStubPlugin],
});
