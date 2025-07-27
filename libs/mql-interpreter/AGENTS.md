# MQL Interpreter Contribution Guide

This directory holds the TypeScript implementation of the MQL interpreter.

## Required Commands

Before committing changes under this folder, run the following:

1. `npm run format` – apply Prettier formatting
2. `npm run lint` – ensure ESLint passes
3. `npm run test` – run the vitest suite

## Additional Notes

- `npm run build` compiles the TypeScript sources as mentioned in [README.md](README.md).
- Refer to [TODO.md](TODO.md) for upcoming features and tasks.
- Avoid using `any` when possible. The ESLint rule is disabled but try to keep the code typed.
