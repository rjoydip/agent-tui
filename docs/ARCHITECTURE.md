# Architecture and Component Relationships

## Architecture Overview

The application follows a layered architecture with clear separation of concerns:

```bash
main.ts (Entry Point)
├── AgentConfig (Configuration)
├── AgentTheme (Theme Management)
├── Renderer (Lifecycle/Singleton Manager)
│       └── createCliRenderer (@opentui/core)
└── Container (UI Composition)
├── BoxRenderable (@opentui/core)
├── InputRenderable (@opentui/core)
└── TextRenderable (@opentui/core)
```

## Component Breakdown

| Component   | File         | Responsibility                    | Pattern           |
| ----------- | ------------ | --------------------------------- | ----------------- |
| main.ts     | Entry point  | Orchestrates initialization       | Procedural        |
| AgentConfig | config.ts    | Banner/configuration management   | Simple Config     |
| AgentTheme  | theme.ts     | Theme loading & variant selection | Strategy          |
| Renderer    | renderer.ts  | CLI renderer lifecycle management | Singleton Manager |
| Container   | container.ts | UI component composition          | Composite         |
| figures.ts  | figures.ts   | Unicode figure symbols            | Utility           |
| utils.ts    | utils.ts     | Terminal Unicode detection        | Utility           |

## Dependency Flow

```bash
@opentui/core
├── createCliRenderer() → CliRenderer
├── BoxRenderable (layout container)
├── InputRenderable (text input with events)
└── TextRenderable (static text display)
```
