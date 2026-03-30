import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { ConfigOpts } from "./config";
import type { AgentThemeOpts } from "./theme";

export interface PersistentConfig {
  config: ConfigOpts;
  theme: AgentThemeOpts;
}

const DEFAULT_CONFIG: PersistentConfig = {
  config: {},
  theme: {},
};

const CONFIG_DIR = join(homedir(), ".agent-tui");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): PersistentConfig {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return DEFAULT_CONFIG;
    }

    const data = readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(data);

    if (typeof parsed !== "object" || parsed === null) {
      console.error("Invalid config file, using defaults");
      return DEFAULT_CONFIG;
    }

    return {
      config: parsed.config ?? DEFAULT_CONFIG.config,
      theme: parsed.theme ?? DEFAULT_CONFIG.theme,
    };
  } catch (error) {
    console.error("Failed to load config:", error);
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: PersistentConfig): void {
  try {
    ensureConfigDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Failed to save config:", error);
  }
}

export function resetConfig(): void {
  try {
    saveConfig(DEFAULT_CONFIG);
  } catch (error) {
    console.error("Failed to reset config:", error);
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
