import { BoxRenderable, TextRenderable } from "@opentui/core";
import type { CliRenderer } from "./renderer";
import type { IAgentTheme, ThemeVariant } from "./theme";

export interface TypingIndicatorOpts {
  renderer: CliRenderer;
  theme: IAgentTheme;
}

export class TypingIndicator {
  private readonly renderer: CliRenderer;
  private readonly theme: IAgentTheme;
  private container: BoxRenderable | null = null;
  private dotsComponent: TextRenderable | null = null;
  private dots = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(options: TypingIndicatorOpts) {
    this.renderer = options.renderer;
    this.theme = options.theme;
  }

  show(): void {
    if (this.container) return;

    const _theme: ThemeVariant = this.theme.getTheme();

    this.container = new BoxRenderable(this.renderer, {
      id: "typing-indicator",
      flexDirection: "row",
      gap: 1,
    });

    const label = new TextRenderable(this.renderer, {
      id: "typing-label",
      content: "Assistant is thinking",
      fg: _theme.seeds.info,
    });

    this.dotsComponent = new TextRenderable(this.renderer, {
      id: "typing-dots",
      content: "...",
      fg: _theme.seeds.info,
    });

    this.container.add(label);
    this.container.add(this.dotsComponent);

    this.intervalId = setInterval(() => {
      this.dots = (this.dots + 1) % 4;
      const dotsText = ".".repeat(this.dots).padEnd(3);
      this.updateDots(dotsText);
    }, 300);

    this.renderer.root.add(this.container);
  }

  private updateDots(text: string): void {
    if (this.dotsComponent) {
      this.dotsComponent.remove("typing-dots");
      const _theme: ThemeVariant = this.theme.getTheme();
      this.dotsComponent = new TextRenderable(this.renderer, {
        id: "typing-dots",
        content: text,
        fg: _theme.seeds.info,
      });
      this.container?.add(this.dotsComponent);
    }
  }

  hide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.container) {
      this.container.remove("typing-indicator");
      this.container = null;
      this.dotsComponent = null;
    }
  }

  isVisible(): boolean {
    return this.container !== null;
  }
}
