export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCalls?: ChatToolCall[];
  toolCallId?: string;
}

export interface ChatToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  tools?: ToolDefinition[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finishReason: string | null;
  }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

export interface StreamChunk {
  id: string;
  delta: string;
  finishReason: string | null;
}

export type StreamHandler = (chunk: StreamChunk) => void;
export type DoneHandler = (finalContent: string) => void;
export type ErrorHandler = (error: Error) => void;

export interface LLMClientOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  defaultTools?: Tool[];
}

export interface ILlmClient {
  chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  chatStream(
    request: ChatCompletionRequest,
    onChunk: StreamHandler,
    onDone: DoneHandler,
    onError: ErrorHandler,
  ): () => void;
  setApiKey(apiKey: string): void;
  setBaseUrl(url: string): void;
}
