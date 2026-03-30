import { BoxRenderable, TextRenderable } from "@opentui/core";
import { cwd } from "node:process";
import type { CliRenderer } from "./renderer";
import type { IAgentTheme, ThemeVariant } from "./theme";
import type { ConnectionStatus, AppMode } from "./types";
import figures from "./figures";
import { version } from "../package.json" with { type: "json" };

export interface StatusBarOpts {
  renderer: CliRenderer;
  theme: IAgentTheme;
}

export class StatusBar {
  private readonly renderer: CliRenderer;
  private readonly theme: IAgentTheme;
  private container: BoxRenderable | null = null;
  private leftBox: BoxRenderable | null = null;
  private rightBox: BoxRenderable | null = null;

  constructor(options: StatusBarOpts) {
    this.renderer = options.renderer;
    this.theme = options.theme;
  }

  render(): void {
    const _theme: ThemeVariant = this.theme.getTheme();
    const currentDir = cwd().split(/[/\\]/).pop() ?? "agent-tui";

    this.container = new BoxRenderable(this.renderer, {
      id: "status-bar",
      flexDirection: "row",
      width: "100%",
      height: 1,
    });

    this.leftBox = new BoxRenderable(this.renderer, {
      id: "status-left",
      flexDirection: "row",
      gap: 1,
    });

    this.rightBox = new BoxRenderable(this.renderer, {
      id: "status-right",
      flexDirection: "row",
      gap: 1,
    });

    const versionText = new TextRenderable(this.renderer, {
      id: "status-version",
      content: `v${version}`,
      fg: _theme.seeds.info,
    });

    const dirText = new TextRenderable(this.renderer, {
      id: "status-dir",
      content: currentDir,
      fg: _theme.seeds.neutral,
    });

    const connectionText = new TextRenderable(this.renderer, {
      id: "status-connection",
      content: `${figures.circle}Offline`,
      fg: _theme.seeds.warning,
    });

    const modeText = new TextRenderable(this.renderer, {
      id: "status-mode",
      content: "[Plan]",
      fg: _theme.seeds.primary,
    });

    const themeText = new TextRenderable(this.renderer, {
      id: "status-theme",
      content: "theme:default",
      fg: _theme.seeds.info,
    });

    const modelText = new TextRenderable(this.renderer, {
      id: "status-model",
      content: "model:llama3",
      fg: _theme.seeds.success,
    });

    const helpText = new TextRenderable(this.renderer, {
      id: "status-help",
      content: "Tab:Mode Ctrl+P:Cmd",
      fg: _theme.seeds.neutral,
    });

    this.leftBox.add(versionText);
    this.leftBox.add(dirText);
    this.leftBox.add(connectionText);

    this.rightBox.add(modeText);
    this.rightBox.add(themeText);
    this.rightBox.add(modelText);
    this.rightBox.add(helpText);

    this.container.add(this.leftBox);
    this.container.add(this.rightBox);
    this.renderer.root.add(this.container);
  }

  updateConnectionStatus(status: ConnectionStatus): void {
    if (!this.leftBox) return;

    const _theme: ThemeVariant = this.theme.getTheme();
    let icon: string;
    let text: string;
    let fg: string;

    switch (status) {
      case "connected":
        icon = figures.tick;
        text = "Online";
        fg = _theme.seeds.success;
        break;
      case "connecting":
        icon = figures.ellipsis;
        text = "Connecting";
        fg = _theme.seeds.warning;
        break;
      case "error":
        icon = figures.cross;
        text = "Error";
        fg = _theme.seeds.error;
        break;
      case "disconnected":
      default:
        icon = figures.circle;
        text = "Offline";
        fg = _theme.seeds.warning;
        break;
    }

    this.leftBox.remove("status-connection");
    const connectionText = new TextRenderable(this.renderer, {
      id: "status-connection",
      content: `${icon}${text}`,
      fg,
    });
    this.leftBox.add(connectionText);
  }

  updateThemeMode(themeName: string, _mode: "light" | "dark"): void {
    if (!this.rightBox) return;

    const _theme: ThemeVariant = this.theme.getTheme();

    this.rightBox.remove("status-theme");
    const themeText = new TextRenderable(this.renderer, {
      id: "status-theme",
      content: `theme:${themeName}`,
      fg: _theme.seeds.info,
    });
    this.rightBox.add(themeText);
  }

  updateModel(model: string): void {
    if (!this.rightBox) return;

    const _theme: ThemeVariant = this.theme.getTheme();

    this.rightBox.remove("status-model");
    const modelText = new TextRenderable(this.renderer, {
      id: "status-model",
      content: `model:${model}`,
      fg: _theme.seeds.success,
    });
    this.rightBox.add(modelText);
  }

  updateAppMode(mode: AppMode): void {
    if (!this.rightBox) return;

    const _theme: ThemeVariant = this.theme.getTheme();

    this.rightBox.remove("status-mode");
    const modeText = new TextRenderable(this.renderer, {
      id: "status-mode",
      content: `[${mode.toUpperCase()}]`,
      fg: _theme.seeds.primary,
    });
    this.rightBox.add(modeText);
  }
}
