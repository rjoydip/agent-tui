# Agent TUI - Development Guide

## Reference Documents

- [README](README.md) - Project overview, file structure, and dev commands
- [Architecture](docs/ARCHITECTURE.md) - Architecture overview, component breakdown, and dependency flow
- [Code Style](docs/CODE_STYLE.md) - TypeScript configuration, naming conventions, class structure, and formatting guidelines

---

## Framework

This is a Bun-based TypeScript TUI application using `@opentui/core` for rendering.

---

## Working with this Codebase

1. Run `bun dev` for development with hot reload
2. Run `bun lint:fix && bun format` before committing
3. Run `bun typecheck` to verify TypeScript correctness
4. Always use `import type` for type-only imports
5. Always use `override` keyword when overriding parent methods
6. Check array bounds when using indexed access
7. Log all errors with `console.error` before fallback handling
