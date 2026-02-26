export type ConfigOpts = {
  banner?: string;
};

/**
 * Defines the contract for a renderer provider.
 * It's responsible for the lifecycle of the renderer instance.
 */

export interface IAgentConfig {
  getOptions(): ConfigOpts;
  getBanner(): string;
}

/**
 * Manages the lifecycle of the CLI renderer instance.
 * This class follows the singleton pattern for the renderer instance,
 * ensuring that only one instance is created and used throughout the application.
 * It is configured at creation and is immutable, promoting predictable behavior.
 */

export class AgentConfig implements IAgentConfig {
  private readonly options: ConfigOpts;

  constructor(options: ConfigOpts = {}) {
    this.options = {
      ...options,
    };
  }

  getOptions(): ConfigOpts {
    return this.options;
  }

  getBanner(): string {
    if (this.options.banner) {
      return this.options.banner;
    }
    return `
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗    ████████╗██╗   ██╗██╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝    ╚══██╔══╝██║   ██║██║
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║          ██║   ██║   ██║██║
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║          ██║   ██║   ██║██║
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║          ██║   ╚██████╔╝██║
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝          ╚═╝    ╚═════╝ ╚═╝
        `;
  }
}
