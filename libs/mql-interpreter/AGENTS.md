# MQL Interpreter Contribution Guide

This directory holds the TypeScript implementation of the MQL interpreter.

## Required Commands

Before committing changes under this folder, run the following:

1. `npm run format` – apply Prettier formatting
2. `npm run lint` – ensure ESLint passes
3. `npm run test -- --run` – run the vitest suite
4. `npm run build` – verify build output

## Platform Constraints

- Code under `src/parser`, `src/runtime`, `src/semantic`, and `src/libs` must remain platform-agnostic. Do **not** import Node.js built-in modules such as `fs`, `path`, or `os` within these directories. Use abstractions like `TerminalStorage` and implement adapters outside these directories.

## Additional Notes

- Avoid using `any` when possible. The ESLint rule is disabled but try to keep the code typed.
