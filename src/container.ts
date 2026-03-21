import { BoxRenderable, InputRenderable, TextRenderable } from "@opentui/core";
import type { IAgentConfig } from "./config";
import type { CliRenderer } from "./renderer";
import type { IAgentTheme, ThemeVariant } from "./theme";

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

  constructor(options: ContainerOpts) {
    this.renderer = options.renderer;
    this.config = options.config;
    this.theme = options.theme;

    this.container = new BoxRenderable(this.renderer, {
      id: "main-container",
      flexDirection: "column",
      gap: 1,
      width: "100%",
      height: "100%",
    });
  }

  render() {
    const _theme: ThemeVariant = this.theme.getTheme();

    const queryContainer = new BoxRenderable(this.renderer, {
      id: "query-container",
      height: 3,
      flexDirection: "row",
      backgroundColor: _theme.overrides?.["text-weak"],
    });

    const queryPrefix = new BoxRenderable(this.renderer, {
      id: "query-prefix",
      backgroundColor: _theme.seeds.primary,
    });

    const queryInput = new InputRenderable(this.renderer, {
      id: "query-input",
      placeholder: "Ask anything...",
      textColor: _theme.seeds.neutral,
      marginTop: 1,
      marginBottom: 1,
      marginLeft: 2,
      onKeyDown: (key) => {
        if (key.name === "escape") {
          queryInput.blur();
        }
      },
    });

    queryInput.focus();
    queryContainer.add(queryPrefix);
    queryContainer.add(queryInput);

    const title = new TextRenderable(this.renderer, {
      id: "title",
      content: this.config.getBanner(),
      fg: _theme.seeds.primary,
      alignItems: "center",
      alignSelf: "center",
    });

    const footerContainer = new BoxRenderable(this.renderer, {
      id: "footer-container",
      width: "100%",
    });

    const footer = new TextRenderable(this.renderer, {
      id: "footer",
      content: "Press Ctrl+C to exit",
      fg: _theme.seeds.warning,
    });

    footerContainer.add(footer);

    this.container.add(title);
    this.container.add(queryContainer);
    this.container.add(footerContainer);

    this.renderer.root.add(this.container);
  }

  remove() {
    this.container.remove("body");
  }
}
