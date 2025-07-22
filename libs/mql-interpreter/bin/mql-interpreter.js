#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { interpret } = require('../dist/index');

const file = process.argv[2];
if (!file) {
  console.error('Usage: mql-interpreter <file.mq4>');
  process.exit(1);
}

const code = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
const runtime = interpret(code, undefined, {
  fileProvider: (p) => {
    try {
      return fs.readFileSync(path.resolve(path.dirname(file), p), 'utf8');
    } catch {
      return undefined;
    }
  },
});
console.log(JSON.stringify(runtime, null, 2));
