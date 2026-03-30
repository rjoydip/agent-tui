export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  result?: string;
}

export interface ResponseStream {
  messageId: string;
  delta: string;
  done: boolean;
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";

export type AppMode = "plan" | "build";

export interface AppState {
  messages: Message[];
  isTyping: boolean;
  connectionStatus: ConnectionStatus;
  themeMode: "light" | "dark";
  appMode: AppMode;
  currentModel: string;
  currentThemeName: string;
}

let messageIdCounter = 0;

export function createMessage(role: MessageRole, content: string): Message {
  return {
    id: `msg_${++messageIdCounter}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

export function createToolCall(name: string, args: string): ToolCall {
  return {
    id: `tool_${++messageIdCounter}`,
    name,
    arguments: args,
  };
}
