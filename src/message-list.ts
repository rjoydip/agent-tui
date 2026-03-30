import { BoxRenderable, TextRenderable } from "@opentui/core";
import type { CliRenderer } from "./renderer";
import type { IAgentTheme, ThemeVariant } from "./theme";
import type { Message } from "./types";
import figures from "./figures";

export interface MessageListOpts {
  renderer: CliRenderer;
  theme: IAgentTheme;
}

export interface IMessageList {
  render(): void;
  update(): void;
  addMessage(message: Message): void;
}

export class MessageList implements IMessageList {
  private readonly renderer: CliRenderer;
  private readonly theme: IAgentTheme;
  private container: BoxRenderable;
  private messages: Message[] = [];

  constructor(options: MessageListOpts) {
    this.renderer = options.renderer;
    this.theme = options.theme;

    this.container = new BoxRenderable(this.renderer, {
      id: "message-list",
      flexDirection: "column",
      gap: 1,
      width: "100%",
    });
  }

  render(): void {
    const _theme: ThemeVariant = this.theme.getTheme();

    this.container = new BoxRenderable(this.renderer, {
      id: "message-list",
      flexDirection: "column",
      gap: 1,
      width: "100%",
      backgroundColor: _theme.overrides?.["bg"],
    });

    this.renderer.root.add(this.container);
  }

  update(): void {
    this.container.remove("message-list");

    const _theme: ThemeVariant = this.theme.getTheme();

    this.container = new BoxRenderable(this.renderer, {
      id: "message-list",
      flexDirection: "column",
      gap: 1,
      width: "100%",
      backgroundColor: _theme.overrides?.["bg"],
    });

    for (const message of this.messages) {
      this.addMessageToContainer(message, _theme);
    }

    this.renderer.root.add(this.container);
  }

  addMessage(message: Message): void {
    this.messages.push(message);
    const _theme: ThemeVariant = this.theme.getTheme();
    this.addMessageToContainer(message, _theme);
  }

  private addMessageToContainer(message: Message, _theme: ThemeVariant): void {
    const prefix = message.role === "user" ? figures.pointer : figures.triangleRight;
    const prefixColor = message.role === "user" ? _theme.seeds.primary : _theme.seeds.success;
    const roleLabel = message.role === "user" ? "You" : "Assistant";

    const messageBox = new BoxRenderable(this.renderer, {
      id: `message-${message.id}`,
      flexDirection: "column",
      width: "100%",
    });

    const header = new TextRenderable(this.renderer, {
      id: `message-header-${message.id}`,
      content: `${prefix} ${roleLabel}`,
      fg: prefixColor,
    });

    const content = new TextRenderable(this.renderer, {
      id: `message-content-${message.id}`,
      content: message.content,
      fg: _theme.seeds.neutral,
      marginLeft: 2,
    });

    messageBox.add(header);
    messageBox.add(content);
    this.container.add(messageBox);
  }

  clear(): void {
    this.messages = [];
    this.update();
  }
}
