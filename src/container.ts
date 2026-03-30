import { BoxRenderable, InputRenderable } from "@opentui/core";
import type { IAgentConfig } from "./config";
import type { CliRenderer } from "./renderer";
import type { IAgentTheme, ThemeVariant } from "./theme";
import { MessageList } from "./message-list";
import { TypingIndicator } from "./typing-indicator";
import { CommandPalette, type Command } from "./command-palette";
import { StatusBar } from "./status-bar";
import { store } from "./store";
import { createMessage } from "./types";
import { LlmClient } from "./llm-client";
import type { ChatMessage } from "./llm-types";

export interface ContainerOpts {
  renderer: CliRenderer;
  config: IAgentConfig;
  theme: IAgentTheme;
}

export interface IContainer {
  render(): void;
  remove(): void;
}

export class Container implements IContainer {
  private readonly renderer: CliRenderer;
  private readonly config: IAgentConfig;
  private readonly theme: IAgentTheme;
  private readonly container: BoxRenderable;
  private messageList: MessageList;
  private typingIndicator: TypingIndicator;
  private commandPalette: CommandPalette;
  private statusBar: StatusBar;
  private queryInput: InputRenderable;
  private llmClient: LlmClient;

  constructor(options: ContainerOpts) {
    this.renderer = options.renderer;
    this.config = options.config;
    this.theme = options.theme;

    this.llmClient = new LlmClient({
      baseUrl: process.env.LLM_BASE_URL ?? "http://localhost:11434",
      apiKey: process.env.LLM_API_KEY ?? "",
      model: process.env.LLM_MODEL ?? "llama3",
    });

    this.container = new BoxRenderable(this.renderer, {
      id: "main-container",
      flexDirection: "column",
      gap: 1,
      width: "100%",
      height: "100%",
    });

    this.messageList = new MessageList({
      renderer: this.renderer,
      theme: this.theme,
    });

    this.typingIndicator = new TypingIndicator({
      renderer: this.renderer,
      theme: this.theme,
    });

    const commands: Command[] = [
      {
        id: "clear",
        label: "Clear Chat",
        description: "Clear all messages",
        action: () => {
          store.clearMessages();
          this.messageList.clear();
        },
      },
      {
        id: "toggle-theme",
        label: "Toggle Theme",
        description: "Switch between light and dark mode",
        action: () => {
          store.toggleThemeMode();
          const state = store.getState();
          this.statusBar.updateThemeMode(state.currentThemeName, state.themeMode);
        },
      },
      {
        id: "quit",
        label: "Quit",
        description: "Exit the application",
        action: () => {
          process.exit(0);
        },
      },
    ];

    this.commandPalette = new CommandPalette({
      renderer: this.renderer,
      theme: this.theme,
      commands,
    });

    this.statusBar = new StatusBar({
      renderer: this.renderer,
      theme: this.theme,
    });

    this.queryInput = null as unknown as InputRenderable;
  }

  private async sendMessage(content: string): Promise<void> {
    if (content.startsWith("/")) {
      this.handleCommand(content);
      return;
    }

    const userMessage = createMessage("user", content);
    store.addMessage(userMessage);
    this.messageList.addMessage(userMessage);

    this.typingIndicator.show();

    const messages: ChatMessage[] = store.getState().messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    const assistantMessage = createMessage("assistant", "");
    store.addMessage(assistantMessage);
    this.messageList.addMessage(assistantMessage);

    const currentModel = store.getState().currentModel;

    this.llmClient.chatStream(
      {
        model: currentModel,
        messages,
      },
      (chunk) => {
        store.updateLastMessage(chunk.delta);
      },
      () => {
        this.typingIndicator.hide();
        this.statusBar.updateConnectionStatus("connected");
      },
      (error) => {
        console.error("LLM Error:", error);
        this.typingIndicator.hide();
        this.statusBar.updateConnectionStatus("error");
      },
    );

    store.subscribe((state) => {
      if (state.messages.length > 0) {
        const lastMsg = state.messages[state.messages.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          this.messageList.addMessage(lastMsg);
        }
      }
    });
  }

  private handleCommand(content: string): void {
    const parts = content.split(" ");
    const command = parts[0]?.toLowerCase() ?? "";
    const args = parts.slice(1).join(" ");

    const state = store.getState();

    switch (command) {
      case "/exit":
      case "/quit":
        process.exit(0);
        break;

      case "/theme": {
        const themeName = args.trim() || "default";
        const mode = state.themeMode;
        store.setCurrentThemeName(themeName);
        this.statusBar.updateThemeMode(themeName, mode);
        const response = createMessage("assistant", `Theme set to: ${themeName} (${mode} mode)`);
        store.addMessage(response);
        this.messageList.addMessage(response);
        break;
      }

      case "/models": {
        const model = args.trim() || "llama3";
        store.setCurrentModel(model);
        this.statusBar.updateModel(model);
        const response = createMessage("assistant", `Model switched to: ${model}`);
        store.addMessage(response);
        this.messageList.addMessage(response);
        break;
      }

      case "/help": {
        const helpText = `Available commands:
/theme <name> - Switch theme (default, nord, dracula, nightowl)
/models <name> - Switch model (default: llama3)
/exit - Quit application
Tab - Toggle Plan/Build mode`;
        const response = createMessage("assistant", helpText);
        store.addMessage(response);
        this.messageList.addMessage(response);
        break;
      }

      default: {
        const response = createMessage(
          "assistant",
          `Unknown command: ${command}. Type /help for available commands.`,
        );
        store.addMessage(response);
        this.messageList.addMessage(response);
      }
    }
  }

  render() {
    const _theme: ThemeVariant = this.theme.getTheme();

    this.messageList.render();

    const inputContainer = new BoxRenderable(this.renderer, {
      id: "input-container",
      height: 3,
      flexDirection: "row",
      backgroundColor: _theme.overrides?.["text-weak"],
    });

    const inputPrefix = new BoxRenderable(this.renderer, {
      id: "input-prefix",
      backgroundColor: _theme.seeds.primary,
    });

    this.queryInput = new InputRenderable(this.renderer, {
      id: "query-input",
      placeholder: "Ask anything... (/help for commands)",
      textColor: _theme.seeds.neutral,
      marginTop: 1,
      marginBottom: 1,
      marginLeft: 2,
      onKeyDown: (key) => {
        if (key.name === "escape") {
          this.queryInput.blur();
        } else if (key.ctrl && key.name === "k") {
          this.commandPalette.toggle();
        } else if (key.ctrl && key.name === "p") {
          process.exit(0);
        } else if (key.name === "tab") {
          store.toggleAppMode();
          this.statusBar.updateAppMode(store.getState().appMode);
        } else if (key.name === "enter") {
          const value = (this.queryInput as unknown as { _value: string })._value;
          if (value?.trim()) {
            this.sendMessage(value.trim());
          }
        }
      },
    });

    this.queryInput.focus();
    inputContainer.add(inputPrefix);
    inputContainer.add(this.queryInput);

    this.statusBar.render();

    this.container.add(this.messageList);
    this.container.add(inputContainer);
    this.container.add(this.statusBar);

    this.renderer.root.add(this.container);
  }

  remove() {
    this.container.remove("main-container");
  }
}
