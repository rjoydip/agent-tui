import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ThemeError } from "./errors";

const ALLOWED_THEMES = ["default", "nord", "dracula", "nightowl"] as const;

const DEFAULT_THEME: ColorTheme = {
  name: "Default",
  id: "default",
  light: {
    seeds: {
      neutral: "#f8f8f2",
      primary: "#7c6bf5",
      success: "#2fbf71",
      warning: "#f7a14d",
      error: "#d9536f",
      info: "#1d7fc5",
      interactive: "#7c6bf5",
      diffAdd: "#9fe3b3",
      diffDelete: "#f8a1b8",
    },
  },
  dark: {
    seeds: {
      neutral: "#1d1e28",
      primary: "#bd93f9",
      success: "#50fa7b",
      warning: "#ffb86c",
      error: "#ff5555",
      info: "#8be9fd",
      interactive: "#bd93f9",
      diffAdd: "#2fb27d",
      diffDelete: "#ff6b81",
    },
  },
};

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
    if (options.theme) {
      return this.validateTheme(options.theme);
    }

    const themeName = options.themeName ?? "default";

    if (!ALLOWED_THEMES.includes(themeName as (typeof ALLOWED_THEMES)[number])) {
      console.error(
        `Invalid theme name '${themeName}'. Allowed themes: ${ALLOWED_THEMES.join(", ")}. Using default.`,
      );
      return DEFAULT_THEME;
    }

    const THEME_PATH: string = resolve(process.cwd(), "themes", `${themeName}.json`);

    if (!existsSync(THEME_PATH)) {
      console.error(`Theme file not found: ${THEME_PATH}. Using default theme.`);
      return DEFAULT_THEME;
    }

    try {
      const themeFile = readFileSync(THEME_PATH, "utf-8");
      const parsed = JSON.parse(themeFile);
      return this.validateTheme(parsed);
    } catch (error) {
      const themeError: ThemeError = new ThemeError(
        `Failed to load theme '${themeName}'`,
        error instanceof Error ? error : undefined,
      );
      console.error(themeError.message);
      return DEFAULT_THEME;
    }
  }

  private validateTheme(theme: unknown): ColorTheme {
    if (
      typeof theme === "object" &&
      theme !== null &&
      "name" in theme &&
      "id" in theme &&
      "light" in theme &&
      "dark" in theme
    ) {
      const t = theme as ColorTheme;
      const validSeedKeys: (keyof ThemeSeedColors)[] = [
        "neutral",
        "primary",
        "success",
        "warning",
        "error",
        "info",
        "interactive",
        "diffAdd",
        "diffDelete",
      ];
      const isValidSeeds = (seeds: unknown): seeds is ThemeSeedColors => {
        if (typeof seeds !== "object" || seeds === null) return false;
        return validSeedKeys.every((k) => {
          const val = (seeds as Record<string, unknown>)[k];
          return typeof val === "string" && /^#[0-9a-fA-F]{6}$/.test(val);
        });
      };
      const isValidVariant = (variant: unknown): variant is ThemeVariant => {
        if (typeof variant !== "object" || variant === null) return false;
        const v = variant as Record<string, unknown>;
        return "seeds" in v && isValidSeeds(v["seeds"]);
      };
      if (isValidVariant(t.light) && isValidVariant(t.dark)) {
        return t;
      }
      console.error(
        "Theme validation failed: light/dark variants must have valid seeds. Using default.",
      );
      return DEFAULT_THEME;
    }
    console.error("Theme validation failed: missing required fields. Using default.");
    return DEFAULT_THEME;
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
    const variant = this.theme[mode];
    if (!variant) {
      console.error(`Theme mode '${mode}' not found. Falling back to 'light'.`);
      return this.theme["light"];
    }
    return variant;
  }

  getThemeMetadata(): Pick<ColorTheme, "name" | "id"> {
    return {
      name: this.theme.name,
      id: this.theme.id,
    };
  }
}
