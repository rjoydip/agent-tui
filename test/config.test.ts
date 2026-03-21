import { describe, test, expect } from "bun:test";
import { AgentConfig } from "../src/config";

describe("AgentConfig", () => {
  describe("constructor", () => {
    test("defaults to empty options", () => {
      const config = new AgentConfig();
      expect(config.getOptions()).toEqual({});
    });

    test("stores provided banner", () => {
      const config = new AgentConfig({ banner: "my banner" });
      expect(config.getOptions()).toEqual({ banner: "my banner" });
    });

    test("stores arbitrary options", () => {
      const config = new AgentConfig({ banner: "test" });
      expect(config.getOptions()).toEqual({ banner: "test" });
    });
  });

  describe("getBanner()", () => {
    test("returns custom banner when provided", () => {
      const customBanner = ">>> CUSTOM BANNER <<<";
      const config = new AgentConfig({ banner: customBanner });
      expect(config.getBanner()).toBe(customBanner);
    });

    test("returns default banner when not provided", () => {
      const config = new AgentConfig();
      const banner = config.getBanner();
      expect(banner).toContain("█████");
    });
  });
});
