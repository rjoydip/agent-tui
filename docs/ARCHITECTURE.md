# Architecture and Component Relationships

## Architecture Overview

The application follows a layered architecture with clear separation of concerns:

```
main.ts (Entry Point)
├── AgentConfig (Configuration)
├── AgentTheme (Theme Management)
├── Renderer (Lifecycle/Singleton Manager)
│       └── createCliRenderer (@opentui/core)
├── LlmClient (LLM API Client)
│   ├── chat() - Non-streaming requests
│   └── chatStream() - Streaming responses
├── ConnectionManager (Connection Management)
└── Container (UI Composition)
    ├── MessageList (Chat history)
    ├── TypingIndicator (Thinking display)
    ├── CommandPalette (Command menu)
    └── StatusBar (Bottom status)
```

## Component Breakdown

| Component | File | Responsibility | Pattern |
| --------- | ---- | -------------- | ------- |
| main.ts | Entry point | Orchestrates initialization | Procedural |
| AgentConfig | config.ts | Banner/configuration management | Simple Config |
| AgentTheme | theme.ts | Theme loading & variant selection | Strategy |
| Renderer | renderer.ts | CLI renderer lifecycle management | Singleton Manager |
| Container | container.ts | UI component composition | Composite |
| LlmClient | llm-client.ts | LLM API communication | Adapter |
| ConnectionManager | connection-manager.ts | Connection health & retry | State Machine |
| StateStore | store.ts | Application state management | Observer |
| MessageList | message-list.ts | Chat message display | Composite |
| CommandPalette | command-palette.ts | Command selection UI | Composite |
| StatusBar | status-bar.ts | Status display | Composite |
| figures.ts | figures.ts | Unicode figure symbols | Utility |
| utils.ts | utils.ts | Terminal Unicode detection | Utility |
| errors.ts | errors.ts | Error type definitions | Error Handling |

## State Management

The application uses a simple pub/sub state store:

```typescript
interface AppState {
  messages: Message[];
  isTyping: boolean;
  connectionStatus: ConnectionStatus;
  themeMode: "light" | "dark";
  appMode: "plan" | "build";
  currentModel: string;
  currentThemeName: string;
}
```

## LLM Client

Supports streaming and non-streaming chat completions:

```typescript
// Non-streaming
const response = await client.chat(request);

// Streaming
const cleanup = client.chatStream(
  request,
  (chunk) => { /* handle delta */ },
  (final) => { /* handle done */ },
  (error) => { /* handle error */ }
);
```

## Dependency Flow

```
@opentui/core
├── createCliRenderer() → CliRenderer
├── BoxRenderable (layout container)
├── InputRenderable (text input with events)
└── TextRenderable (static text display)
```
