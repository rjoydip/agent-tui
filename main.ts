import { AgentConfig } from "./src/config";
import { Container } from "./src/container";
import { Renderer } from "./src/renderer";
import { AgentTheme } from "./src/theme";
import { getCliArgs, showHelp } from "./src/cli";
import { loadConfig, saveConfig } from "./src/persistent-config";
import { version } from "./package.json" with { type: "json" };

async function main() {
  const cliArgs = getCliArgs();

  if (cliArgs.help) {
    showHelp();
    process.exit(0);
  }

  if (cliArgs.version) {
    console.log(`agent-tui v${version}`);
    process.exit(0);
  }

  const savedConfig = loadConfig();

  const mergedTheme = {
    ...savedConfig.theme,
    ...cliArgs.theme,
  };

  const mergedConfig = {
    ...savedConfig.config,
    ...cliArgs.config,
  };

  const config = new AgentConfig(mergedConfig);
  const theme = new AgentTheme(mergedTheme);
  const rendererManager = new Renderer();
  const renderer = await rendererManager.get();

  const container = new Container({
    renderer,
    config,
    theme,
  });

  container.render();

  process.on("exit", () => {
    saveConfig({
      config: mergedConfig,
      theme: mergedTheme,
    });
  });
}

main().catch(console.error);
