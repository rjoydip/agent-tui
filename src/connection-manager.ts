import type { ConnectionStatus } from "./types";
import { store } from "./store";

type StatusListener = (status: ConnectionStatus) => void;

export interface ConnectionManagerOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  healthCheckUrl?: string;
}

export class ConnectionManager {
  private status: ConnectionStatus = "disconnected";
  private listeners: Set<StatusListener> = new Set();
  private retryCount = 0;
  private maxRetries: number;
  private retryDelayMs: number;
  private healthCheckUrl?: string;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private isChecking = false;

  constructor(options: ConnectionManagerOptions = {}) {
    this.maxRetries = options.maxRetries ?? 5;
    this.retryDelayMs = options.retryDelayMs ?? 2000;
    this.healthCheckUrl = options.healthCheckUrl;
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    store.setConnectionStatus(status);

    for (const listener of this.listeners) {
      listener(status);
    }
  }

  async connect(): Promise<void> {
    if (this.status === "connected" || this.status === "connecting") {
      return;
    }

    this.setStatus("connecting");

    try {
      if (this.healthCheckUrl) {
        await this.performHealthCheck();
      }

      this.retryCount = 0;
      this.setStatus("connected");
      this.startHealthCheck();
    } catch (error) {
      console.error("Connection failed:", error);
      this.setStatus("error");
      await this.scheduleRetry();
    }
  }

  async disconnect(): Promise<void> {
    this.stopHealthCheck();
    this.setStatus("disconnected");
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.healthCheckUrl) return;

    const response = await fetch(this.healthCheckUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
  }

  private startHealthCheck(): void {
    if (!this.healthCheckUrl || this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(async () => {
      if (this.isChecking) return;

      this.isChecking = true;
      try {
        await this.performHealthCheck();
        if (this.status !== "connected") {
          this.setStatus("connected");
        }
      } catch {
        this.setStatus("error");
        await this.scheduleRetry();
      } finally {
        this.isChecking = false;
      }
    }, 30000);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private async scheduleRetry(): Promise<void> {
    if (this.retryCount >= this.maxRetries) {
      console.error(`Max retries (${this.maxRetries}) reached`);
      this.setStatus("error");
      return;
    }

    this.retryCount++;
    const delay = this.retryDelayMs * this.retryCount;

    console.log(
      `Retrying connection in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      if (this.healthCheckUrl) {
        await this.performHealthCheck();
      }
      this.retryCount = 0;
      this.setStatus("connected");
    } catch {
      await this.scheduleRetry();
    }
  }

  reset(): void {
    this.retryCount = 0;
    this.stopHealthCheck();
  }
}

export const connectionManager = new ConnectionManager();
