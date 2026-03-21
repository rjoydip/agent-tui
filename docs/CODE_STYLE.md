# Code Style & TypeScript Guidelines

## TypeScript Configuration

- **Strict mode** is enabled in `tsconfig.json`
- Use `noUncheckedIndexedAccess: true` - always check array bounds
- Use `noImplicitOverride: true` - always use `override` keyword when overriding parent methods
- Use `verbatimModuleSyntax: true` - requires explicit imports/exports

## Imports

- External imports first, then relative imports
- Use explicit type imports with the `type` keyword when only importing types:

  ```typescript
  import type { SomeType } from "./some-module";
  import { someFunction } from "some-package";
  ```

## Naming Conventions

- **Classes**: PascalCase (e.g., `AgentConfig`, `Container`)
- **Interfaces**: PascalCase with `I` prefix for contracts (e.g., `IAgentConfig`, `IRenderer`)
- **Types**: PascalCase (e.g., `HexColor`, `ConfigOpts`)
- **Methods/variables**: camelCase (e.g., `getOptions()`, `themeName`)
- **Constants**: PascalCase for exported, camelCase for private

## Class Structure

```typescript
export class MyClass implements IMyInterface {
  // Private readonly fields first
  private readonly options: MyOptions;
  private instance: MyInstance | null = null;

  // Constructor
  constructor(options: MyOptions = {}) {
    this.options = { ...options };
  }

  // Public methods
  public async get(): Promise<MyInstance> { ... }

  // Private methods
  private loadSomething(): void { ... }
}
```

## Error Handling

- Use try-catch blocks with `console.error` for logging
- Provide fallback values where appropriate
- Do not silently swallow errors without logging

## Documentation

- Use JSDoc comments for classes and public methods
- Include `@returns` and `@param` descriptions
- Keep comments concise and meaningful

## Code Patterns

- Use **singleton pattern** for renderer instances (see `src/renderer.ts`)
- Use **dependency injection** via constructor options
- Use **interfaces** to define contracts (e.g., `IRenderer`, `IContainer`)
- Make options readonly where immutability matters

## Formatting (oxfmt)

- Run `bun format` before committing
- Uses default oxfmt settings (minimal config)

## Pre-commit Hook

The project uses `simple-git-hooks` with a pre-commit hook that runs:

```bash
bun lint && bun typecheck && bun run actions:up
```

All checks must pass before committing.
