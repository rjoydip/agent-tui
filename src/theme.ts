import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type HexColor = `#${string}`;
export type CssVarRef = `var(--${string})`;
export type ColorValue = HexColor | CssVarRef;

export interface ThemeSeedColors {
  neutral: HexColor;
  primary: HexColor;
  success: HexColor;
  warning: HexColor;
  error: HexColor;
  info: HexColor;
  interactive: HexColor;
  diffAdd: HexColor;
  diffDelete: HexColor;
}

export interface ThemeVariant {
  seeds: ThemeSeedColors;
  overrides?: Record<string, ColorValue>;
}

export interface ColorTheme {
  name: string;
  id: string;
  light: ThemeVariant;
  dark: ThemeVariant;
}

export interface AgentThemeOpts {
  theme?: ColorTheme;
  mode?: "light" | "dark";
  themeName?: string;
}

export interface IAgentTheme {
  getOptions(): AgentThemeOpts;
  getTheme(): ThemeVariant;
  getThemeMetadata(): Pick<ColorTheme, "name" | "id">;
}

export class AgentTheme implements IAgentTheme {
  private readonly theme: ColorTheme;
  private readonly options: AgentThemeOpts;

  constructor(options: AgentThemeOpts = {}) {
    this.options = {
      ...options,
    };
    this.theme = this.loadTheme(options);
  }

  private loadTheme(options: AgentThemeOpts): ColorTheme {
    const THEME_PATH: string = resolve(
      process.cwd(),
      "themes",
      `${options.themeName ?? "default"}.json`,
    );

    if (existsSync(THEME_PATH)) {
      try {
        const themeFile = readFileSync(THEME_PATH, "utf-8");
        return JSON.parse(themeFile);
      } catch (error) {
        console.error(
          `Failed to load theme '${options.themeName}'. Falling back to default.`,
          error,
        );
        return JSON.parse(readFileSync(THEME_PATH, "utf-8"));
      }
    }
    return options.theme ?? JSON.parse(readFileSync(THEME_PATH, "utf-8"));
  }

  getOptions(): AgentThemeOpts {
    return this.options;
  }

  /**
   * Returns the theme variant (light or dark) based on the mode set in the options.
   * Defaults to 'light' mode if not specified.
   */
  getTheme(): ThemeVariant {
    const mode = this.options.mode ?? "light";
    return this.theme[mode];
  }

  getThemeMetadata(): Pick<ColorTheme, "name" | "id"> {
    return {
      name: this.theme.name,
      id: this.theme.id,
    };
  }
}
