import { AgentConfig } from "./src/config";
import { Container } from "./src/container";
import { Renderer } from "./src/renderer";
import { AgentTheme } from "./src/theme";

/**
 * The main entry point for the TUI application.
 *
 * This function orchestrates the setup of the application's core components:
 * 1. It initializes the `AgentConfig` to load configuration.
 * 2. It sets up the `Renderer` which manages the lifecycle of the terminal UI.
 * 3. It creates the main `Container` component, injecting the renderer and config.
 * 4. It calls the `render` method to display the UI.
 */
async function main() {
  const config = new AgentConfig();
  const theme = new AgentTheme({
    themeName: "default",
    mode: "light",
  });
  const rendererManager = new Renderer();
  const renderer = await rendererManager.get();

  const container = new Container({
    renderer,
    config,
    theme,
  });

  container.render();
}

main().catch(console.error);
