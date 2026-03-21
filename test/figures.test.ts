import { describe, test, expect } from "bun:test";
import figures, { mainSymbols, fallbackSymbols, replaceSymbols } from "../src/figures";

describe("figures", () => {
  test("figures default export is an object", () => {
    expect(typeof figures).toBe("object");
    expect(figures).not.toBeNull();
  });

  test("figures has expected keys", () => {
    expect(figures).toHaveProperty("tick");
    expect(figures).toHaveProperty("cross");
    expect(figures).toHaveProperty("info");
    expect(figures).toHaveProperty("warning");
    expect(figures).toHaveProperty("ellipsis");
    expect(figures).toHaveProperty("pointer");
  });

  test("mainSymbols and fallbackSymbols are objects", () => {
    expect(typeof mainSymbols).toBe("object");
    expect(typeof fallbackSymbols).toBe("object");
  });

  test("mainSymbols has all required figure keys", () => {
    const requiredKeys = [
      "tick",
      "cross",
      "info",
      "warning",
      "ellipsis",
      "pointer",
      "arrowUp",
      "arrowDown",
      "lineVertical",
      "star",
      "checkboxOn",
      "checkboxOff",
    ];
    for (const key of requiredKeys) {
      expect(mainSymbols).toHaveProperty(key);
    }
  });
});

describe("replaceSymbols", () => {
  test("returns text unchanged when useFallback is false", () => {
    const result = replaceSymbols("✔ ✘ ℹ ⚠", { useFallback: false });
    expect(result).toBe("✔ ✘ ℹ ⚠");
  });

  test("replaces main symbols with fallbacks when useFallback is true", () => {
    const result = replaceSymbols("✔ ✘ ℹ ⚠", { useFallback: true });
    expect(result).toBe("√ × i ‼");
  });

  test("replaces multiple occurrences of same symbol", () => {
    const result = replaceSymbols("✔ ✔ ✔", { useFallback: true });
    expect(result).toBe("√ √ √");
  });

  test("returns original text with unknown symbols unchanged", () => {
    const result = replaceSymbols("unknown text", { useFallback: true });
    expect(result).toBe("unknown text");
  });
});
