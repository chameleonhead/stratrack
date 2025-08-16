#!/usr/bin/env node
import { program } from "commander";
import { interpret } from "./index";

program.name("mqli").description("MQL interpreter CLI").version("0.1.0");

program
  .command("check <file>")
  .description("コンパイルチェック")
  .action((file) => {
    console.log("Checking:", file);
    const result = interpret(file);
    console.log(result);
  });

program.parse();
