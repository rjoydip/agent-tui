import { BoxRenderable, InputRenderable, TextRenderable } from "@opentui/core";
import type { CliRenderer } from "./renderer";
import type { IAgentTheme, ThemeVariant } from "./theme";
import figures from "./figures";

export interface Command {
  id: string;
  label: string;
  description: string;
  action: () => void | Promise<void>;
}

export interface CommandPaletteOpts {
  renderer: CliRenderer;
  theme: IAgentTheme;
  commands: Command[];
}

export class CommandPalette {
  private readonly renderer: CliRenderer;
  private readonly theme: IAgentTheme;
  private readonly commands: Command[];
  private overlay: BoxRenderable | null = null;
  private input: InputRenderable | null = null;
  private resultsBox: BoxRenderable | null = null;
  private selectedIndex = 0;
  private filteredCommands: Command[] = [];
  private isOpen = false;

  constructor(options: CommandPaletteOpts) {
    this.renderer = options.renderer;
    this.theme = options.theme;
    this.commands = options.commands;
    this.filteredCommands = [...this.commands];
  }

  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.selectedIndex = 0;
    this.filteredCommands = [...this.commands];
    this.render();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.overlay) {
      this.overlay.remove("command-palette");
      this.overlay = null;
      this.input = null;
      this.resultsBox = null;
    }
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  isVisible(): boolean {
    return this.isOpen;
  }

  private render(): void {
    const _theme: ThemeVariant = this.theme.getTheme();

    this.overlay = new BoxRenderable(this.renderer, {
      id: "command-palette",
      flexDirection: "column",
      width: "80%",
      maxWidth: 60,
      backgroundColor: _theme.seeds.neutral,
    });

    const inputContainer = new BoxRenderable(this.renderer, {
      id: "command-palette-input",
      flexDirection: "row",
      height: 3,
      backgroundColor: _theme.seeds.primary,
    });

    this.input = new InputRenderable(this.renderer, {
      id: "command-input",
      placeholder: "Type a command...",
      textColor: _theme.seeds.neutral,
      marginLeft: 1,
      onKeyDown: (key) => {
        if (key.name === "escape") {
          this.close();
        } else if (key.name === "arrowup") {
          this.selectPrevious();
        } else if (key.name === "arrowdown") {
          this.selectNext();
        } else if (key.name === "enter") {
          this.executeSelected();
        }
      },
    });

    this.input.focus();

    inputContainer.add(this.input);

    this.resultsBox = new BoxRenderable(this.renderer, {
      id: "command-results",
      flexDirection: "column",
      gap: 0,
      height: 10,
    });

    this.renderResults(_theme);

    this.overlay.add(inputContainer);
    this.overlay.add(this.resultsBox);

    this.renderer.root.add(this.overlay);
  }

  private renderResults(_theme: ThemeVariant): void {
    if (!this.resultsBox) return;

    this.resultsBox.remove("command-results");

    this.resultsBox = new BoxRenderable(this.renderer, {
      id: "command-results",
      flexDirection: "column",
      gap: 0,
      height: 10,
    });

    for (let i = 0; i < this.filteredCommands.length; i++) {
      const cmd = this.filteredCommands[i];
      if (!cmd) continue;

      const isSelected = i === this.selectedIndex;
      const prefix = isSelected ? figures.pointer : " ";
      const fg = isSelected ? _theme.seeds.primary : _theme.seeds.neutral;

      const resultItem = new TextRenderable(this.renderer, {
        id: `command-result-${cmd.id}`,
        content: `${prefix} ${cmd.label}`,
        fg,
      });

      const description = new TextRenderable(this.renderer, {
        id: `command-desc-${cmd.id}`,
        content: `   ${cmd.description}`,
        fg: _theme.seeds.info,
      });

      this.resultsBox.add(resultItem);
      this.resultsBox.add(description);
    }

    this.overlay?.add(this.resultsBox);
  }

  private filterCommands(query: string): void {
    if (!query.trim()) {
      this.filteredCommands = [...this.commands];
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredCommands = this.commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(lowerQuery) ||
          cmd.description.toLowerCase().includes(lowerQuery),
      );
    }

    this.selectedIndex = 0;
    const _theme: ThemeVariant = this.theme.getTheme();
    this.renderResults(_theme);
  }

  private selectPrevious(): void {
    if (this.filteredCommands.length === 0) return;
    this.selectedIndex =
      (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
    const _theme: ThemeVariant = this.theme.getTheme();
    this.renderResults(_theme);
  }

  private selectNext(): void {
    if (this.filteredCommands.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
    const _theme: ThemeVariant = this.theme.getTheme();
    this.renderResults(_theme);
  }

  private executeSelected(): void {
    const cmd = this.filteredCommands[this.selectedIndex];
    if (cmd) {
      this.close();
      cmd.action();
    }
  }
}
