import type { ConfigOpts } from "./config";
import type { AgentThemeOpts } from "./theme";

export interface CliArgs {
  config: ConfigOpts;
  theme: AgentThemeOpts;
  help: boolean;
  version: boolean;
}

const DEFAULT_CLI_ARGS: CliArgs = {
  config: {},
  theme: {},
  help: false,
  version: false,
};

const ALLOWED_THEMES = ["default", "nord", "dracula", "nightowl"] as const;
const THEMES_HELP = ALLOWED_THEMES.join(", ");

const HELP_TEXT = `
Usage: agent-tui [options]

Options:
  --theme <name>     Theme to use (${THEMES_HELP}) [default: default]
  --mode <mode>      Color mode: light or dark [default: light]
  --banner <text>   Custom banner text
  --no-banner       Disable banner display
  --help            Show this help message
  --version         Show version number

Examples:
  agent-tui --theme nord --mode dark
  agent-tui --banner "Hello World"
  agent-tui --no-banner
`;

function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = { ...DEFAULT_CLI_ARGS };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--help":
      case "-h":
        result.help = true;
        break;

      case "--version":
      case "-v":
        result.version = true;
        break;

      case "--theme": {
        const themeName = args[++i];
        if (!themeName || themeName?.startsWith("-")) {
          console.error("--theme requires a value");
          process.exit(1);
        }
        if (!ALLOWED_THEMES.includes(themeName as (typeof ALLOWED_THEMES)[number])) {
          console.error(`Invalid theme '${themeName}'. Allowed: ${THEMES_HELP}`);
          process.exit(1);
        }
        result.theme.themeName = themeName;
        break;
      }

      case "--mode": {
        const mode = args[++i];
        if (!mode || mode.startsWith("-")) {
          console.error("--mode requires a value (light or dark)");
          process.exit(1);
        }
        if (mode !== "light" && mode !== "dark") {
          console.error("--mode must be 'light' or 'dark'");
          process.exit(1);
        }
        result.theme.mode = mode;
        break;
      }

      case "--banner": {
        const banner = args[++i];
        if (!banner || banner.startsWith("-")) {
          console.error("--banner requires a value");
          process.exit(1);
        }
        result.config.banner = banner;
        break;
      }

      case "--no-banner":
        result.config.banner = "";
        break;

      default:
        if (arg?.startsWith("-")) {
          console.error(`Unknown option: ${arg}`);
          console.error("Use --help for usage information");
          process.exit(1);
        }
        break;
    }
  }

  return result;
}

export function getCliArgs(args: string[] = process.argv.slice(2)): CliArgs {
  return parseArgs(args);
}

export function showHelp(): void {
  console.log(HELP_TEXT);
}
