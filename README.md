# Agent TUI

A Bun-based TypeScript TUI (Terminal User Interface) application using `@opentui/core` for rendering.

## Features

- **Chat Interface**: Interactive chat with AI assistant
- **Command Palette**: Press `Ctrl+K` to access commands
- **Theme Switching**: Multiple themes (default, nord, dracula, nightowl)
- **Model Switching**: Support for multiple LLM models
- **Keyboard Shortcuts**: Efficient keyboard-driven navigation

## Commands

| Command | Description |
| ------- | ----------- |
| `/theme <name>` | Switch theme (default, nord, dracula, nightowl) |
| `/models <name>` | Switch LLM model |
| `/exit` | Exit application |
| `/help` | Show available commands |

## Keyboard Shortcuts

| Shortcut | Action |
| -------- | ------ |
| `Tab` | Toggle Plan/Build mode |
| `Ctrl+K` | Open command palette |
| `Ctrl+P` | Quit application |
| `Enter` | Send message |

## Installation & Running

```bash
bun install              # Install dependencies
bun dev                  # Run in development mode with file watching
bun start                # Run the application
```

## Linting & Formatting

```bash
bun lint                 # Run oxlint to check code quality
bun lint:fix             # Run oxlint with auto-fix
bun format               # Run oxfmt to format code
```

## Type Checking & Pre-commit

```bash
bun typecheck            # Run TypeScript type checking (tsgo)
bun run actions:up       # Run actions-up (updates?)
```

## Testing

```bash
bun test                 # Run tests
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `LLM_BASE_URL` | http://localhost:11434 | LLM API endpoint |
| `LLM_API_KEY` | - | API key for authentication |
| `LLM_MODEL` | llama3 | Default model to use |

## File Organization

```bash
├── main.ts                    # Entry point
├── src/
│   ├── cli.ts                 # CLI argument parsing
│   ├── config.ts              # Configuration management
│   ├── container.ts           # Main UI container component
│   ├── renderer.ts            # Renderer lifecycle management
│   ├── theme.ts               # Theme loading and management
│   ├── utils.ts               # Utility functions
│   ├── figures.ts             # Figure/shape utilities
│   ├── errors.ts              # Error types
│   ├── types.ts               # TypeScript type definitions
│   ├── store.ts               # State management
│   ├── message-list.ts        # Chat message display
│   ├── typing-indicator.ts    # Thinking indicator
│   ├── command-palette.ts     # Command palette UI
│   ├── status-bar.ts          # Bottom status bar
│   ├── llm-types.ts           # LLM client types
│   ├── llm-client.ts          # LLM HTTP client
│   └── connection-manager.ts  # Connection management
├── test/                      # Test files
├── docs/                     # Documentation
├── themes/                   # Theme JSON files
├── .oxlintrc.json            # Linting rules
├── .oxfmtrc.json            # Formatting rules
└── tsconfig.json            # TypeScript configuration
```
