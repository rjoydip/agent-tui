import type {
  ILlmClient,
  LLMClientOptions,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  Tool,
} from "./llm-types";

export class LlmClient implements ILlmClient {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private tools: Tool[];

  constructor(options: LLMClientOptions) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.tools = options.defaultTools ?? [];
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        ...request,
        model: request.model ?? this.model,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<ChatCompletionResponse>;
  }

  chatStream(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    onDone: (finalContent: string) => void,
    onError: (error: Error) => void,
  ): () => void {
    let content = "";
    let finished = false;
    let controller: AbortController | null = null;

    const cleanup = () => {
      finished = true;
      if (controller) {
        controller.abort();
      }
    };

    const run = async () => {
      controller = new AbortController();

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            ...request,
            model: request.model ?? this.model,
            stream: true,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`API error: ${response.status} - ${error}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!finished) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              finished = true;
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              const finishReason = parsed.choices?.[0]?.finishReason ?? null;

              if (delta) {
                content += delta;
                onChunk({
                  id: parsed.id ?? "",
                  delta,
                  finishReason,
                });
              }

              if (finishReason) {
                finished = true;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }

        onDone(content);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    run();

    return cleanup;
  }

  addTool(tool: Tool): void {
    this.tools.push(tool);
  }

  removeTool(name: string): void {
    this.tools = this.tools.filter((t) => t.name !== name);
  }

  getTools(): Tool[] {
    return [...this.tools];
  }

  async executeTool(toolCall: { name: string; arguments: string }): Promise<string> {
    const tool = this.tools.find((t) => t.name === toolCall.name);

    if (!tool) {
      return JSON.stringify({ error: `Tool '${toolCall.name}' not found` });
    }

    try {
      const args = JSON.parse(toolCall.arguments);
      const result = await tool.execute(args);
      return result;
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
