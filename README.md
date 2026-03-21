# try-opentui

## Project Overview

This is a Bun-based TypeScript TUI (Terminal User Interface) application using `@opentui/core` for rendering.

## Development & CLI Commands Guide

### Installation & Running

```bash
bun install              # Install dependencies
bun dev                  # Run in development mode with file watching
bun start                # Run the application
```

### Linting & Formatting

```bash
bun lint                 # Run oxlint to check code quality
bun lint:fix             # Run oxlint with auto-fix
bun format               # Run oxfmt to format code
```

### Type Checking & Pre-commit

```bash
bun typecheck            # Run TypeScript type checking (tsgo)
bun run actions:up       # Run actions-up (updates?)
```

**Note:** There is no test framework configured in this project yet.

---

## File Organization

```bash
├── main.ts              # Entry point
├── src/
│   ├── config.ts       # Configuration management
│   ├── container.ts    # Main UI container component
│   ├── renderer.ts     # Renderer lifecycle management
│   ├── theme.ts        # Theme loading and management
│   ├── utils.ts        # Utility functions
│   └── figures.ts      # Figure/shape utilities
├── docs/               # Documentation
├── themes/             # Theme JSON files
├── .oxlintrc.json      # Linting rules
├── .oxfmtrc.json       # Formatting rules
└── tsconfig.json       # TypeScript configuration
```
