import { createCliRenderer } from "@opentui/core";
import { RendererError } from "./errors";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

export type CliRenderer = Awaited<ReturnType<typeof createCliRenderer>>;
export type CliRendererOptions = Parameters<typeof createCliRenderer>[0];

// Options for the renderer, derived from the core library for type safety.
export type RendererOpts = Parameters<typeof createCliRenderer>[0];

/**
 * Defines the contract for a renderer provider.
 * It's responsible for the lifecycle of the renderer instance.
 */
export interface IRenderer {
  get(): Promise<CliRenderer>;
  destroy(): Promise<void>;
  getOptions(): RendererOpts;
}

/**
 * Manages the lifecycle of the CLI renderer instance.
 * This class follows the singleton pattern for the renderer instance,
 * ensuring that only one instance is created and used throughout the application.
 * It is configured at creation and is immutable, promoting predictable behavior.
 */
export class Renderer implements IRenderer {
  /**
   * Options are readonly to enforce immutability after construction.
   * If you need a renderer with different options, create a new Renderer manager.
   */
  private readonly options: RendererOpts;
  private instance: CliRenderer | null = null;

  /**
   * Constructs the Renderer manager.
   * @param options - Configuration options for creating the CLI renderer.
   */
  constructor(options: RendererOpts = {}) {
    this.options = {
      exitOnCtrlC: true,
      ...options,
    };
  }

  /**
   * Lazily creates and returns a single instance of the CLI renderer.
   * Includes retry logic for failed initializations.
   * @returns A promise that resolves to the CliRenderer instance.
   */
  async get(): Promise<CliRenderer> {
    if (this.instance) {
      return this.instance;
    }

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.instance = await createCliRenderer(this.options);
        return this.instance;
      } catch (error) {
        lastError = error instanceof Error ? error : new RendererError(String(error));
        console.error(
          `Renderer initialization attempt ${attempt}/${MAX_RETRIES} failed:`,
          lastError.message,
        );

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        }
      }
    }

    throw new RendererError(
      `Failed to initialize renderer after ${MAX_RETRIES} attempts`,
      lastError,
    );
  }

  /**
   * Destroys the renderer instance and cleans up resources.
   */
  async destroy() {
    if (this.instance) {
      await this.instance.destroy();
      this.instance = null;
    }
  }

  getOptions(): RendererOpts {
    return this.options;
  }
}
