#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { program } from "commander";
import { interpret } from "./index";

program.name("mqli").description("MQL interpreter CLI").version("0.1.0");

program
  .command("check <file>")
  .description("コンパイルチェック")
  .action((file: string) => {
    console.log("Checking:", file);
    const code = readFileSync(file, "utf8");
    const result = interpret(code);
    console.log(result);
  });

program.parse();
