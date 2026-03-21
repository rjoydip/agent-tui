import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { AgentTheme, type ColorTheme, type ThemeVariant } from "../src/theme";

const VALID_THEME: ColorTheme = {
  name: "Test Theme",
  id: "test-theme",
  light: {
    seeds: {
      neutral: "#ffffff",
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

const MALFORMED_THEMES = {
  missingSeeds: {
    name: "Bad",
    id: "bad",
    light: {},
    dark: {},
  } as unknown as ColorTheme,
  missingFields: {
    name: "Bad",
    id: "bad",
  } as unknown as ColorTheme,
  invalidHex: {
    name: "Bad",
    id: "bad",
    light: {
      seeds: {
        neutral: "#ffffff",
        primary: "not-a-color",
        success: "#2fbf71",
        warning: "#f7a14d",
        error: "#d9536f",
        info: "#1d7fc5",
        interactive: "#7c6bf5",
        diffAdd: "#9fe3b3",
        diffDelete: "#f8a1b8",
      },
    },
    dark: VALID_THEME.dark,
  } as unknown as ColorTheme,
  missingDarkVariant: {
    name: "Light Only",
    id: "light-only",
    light: VALID_THEME.light,
    dark: {} as ThemeVariant,
  } as unknown as ColorTheme,
};

describe("AgentTheme", () => {
  let origError: typeof console.error;
  beforeEach(() => {
    origError = console.error;
    console.error = () => {};
  });
  afterEach(() => {
    console.error = origError;
  });

  describe("constructor", () => {
    test("defaults to empty options", () => {
      const theme = new AgentTheme();
      expect(theme.getOptions()).toEqual({});
    });

    test("stores provided options", () => {
      const opts = { mode: "dark" as const, themeName: "nord" };
      const theme = new AgentTheme(opts);
      expect(theme.getOptions()).toEqual(opts);
    });
  });

  describe("getTheme()", () => {
    test("returns light variant by default", () => {
      const theme = new AgentTheme({ theme: VALID_THEME });
      expect(theme.getTheme()).toEqual(VALID_THEME.light);
    });

    test("returns dark variant when mode is dark", () => {
      const theme = new AgentTheme({ theme: VALID_THEME, mode: "dark" });
      expect(theme.getTheme()).toEqual(VALID_THEME.dark);
    });

    test("falls back to light if requested mode is missing", () => {
      const theme = new AgentTheme({ theme: VALID_THEME, mode: "dark" });
      expect(theme.getTheme()).toEqual(VALID_THEME.dark);
    });
  });

  describe("getThemeMetadata()", () => {
    test("returns name and id", () => {
      const theme = new AgentTheme({ theme: VALID_THEME });
      expect(theme.getThemeMetadata()).toEqual({ name: "Test Theme", id: "test-theme" });
    });
  });

  describe("validateTheme", () => {
    test("accepts a valid theme with all seed colors", () => {
      const theme = new AgentTheme({ theme: VALID_THEME });
      expect(theme.getThemeMetadata().id).toBe("test-theme");
    });

    test("rejects theme missing required top-level fields", () => {
      const theme = new AgentTheme({ theme: MALFORMED_THEMES.missingFields });
      expect(theme.getThemeMetadata().id).toBe("default");
    });

    test("rejects theme with variants missing seeds", () => {
      const theme = new AgentTheme({ theme: MALFORMED_THEMES.missingSeeds });
      expect(theme.getThemeMetadata().id).toBe("default");
    });

    test("rejects theme with invalid hex color in seeds", () => {
      const theme = new AgentTheme({ theme: MALFORMED_THEMES.invalidHex });
      expect(theme.getThemeMetadata().id).toBe("default");
    });

    test("rejects theme with empty dark variant", () => {
      const theme = new AgentTheme({ theme: MALFORMED_THEMES.missingDarkVariant });
      expect(theme.getThemeMetadata().id).toBe("default");
    });
  });
});
