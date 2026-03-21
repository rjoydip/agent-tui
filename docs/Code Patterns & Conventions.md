# Code Patterns & Conventions

## Patterns Used

1. **Singleton Pattern** - Renderer manages a single CliRenderer instance
2. **Interface-based Contracts** - IRenderer, IAgentConfig, IAgentTheme, IContainer
3. **Dependency Injection** - Options objects passed via constructor
4. **Immutable Options** - readonly fields where appropriate

## Naming Conventions (Mostly Followed)

- **Classes:** PascalCase (`AgentConfig`, `Container`) ✅
- **Interfaces:** PascalCase with I prefix (`IAgentConfig`) ✅
- **Types:** PascalCase (`ConfigOpts`, `HexColor`) ✅
- **Methods/variables:** camelCase ✅
- **Private fields:** private readonly ✅

## Import Organization

- External imports first ✅
- Relative imports second ✅
- Explicit type imports where needed ✅
