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
const runtime = interpret(code);
console.log(JSON.stringify(runtime, null, 2));
