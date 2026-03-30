export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentError";
  }
}

export class RendererError extends AgentError {
  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "RendererError";
  }
}

export class ThemeError extends AgentError {
  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "ThemeError";
  }
}

export class ConfigError extends AgentError {
  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "ConfigError";
  }
}

export class ContainerError extends AgentError {
  constructor(
    message: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = "ContainerError";
  }
}

export function wrapError<T extends AgentError>(error: unknown, fallback: T): T {
  if (error instanceof Error) {
    console.error(error.message);
    return fallback;
  }
  console.error(error);
  return fallback;
}
