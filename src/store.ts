import type { AppState, Message, ConnectionStatus, AppMode } from "./types";

type Listener = (state: AppState) => void;

class StateStore {
  private state: AppState = {
    messages: [],
    isTyping: false,
    connectionStatus: "disconnected",
    themeMode: "light",
    appMode: "plan",
    currentModel: "llama3",
    currentThemeName: "default",
  };

  private listeners: Set<Listener> = new Set();

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  addMessage(message: Message): void {
    this.state = {
      ...this.state,
      messages: [...this.state.messages, message],
    };
    this.notify();
  }

  updateLastMessage(content: string): void {
    if (this.state.messages.length === 0) return;

    const messages = [...this.state.messages];
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    messages[messages.length - 1] = {
      ...lastMessage,
      content: lastMessage.content + content,
    };

    this.state = { ...this.state, messages };
    this.notify();
  }

  clearMessages(): void {
    this.state = { ...this.state, messages: [] };
    this.notify();
  }

  setTyping(isTyping: boolean): void {
    this.state = { ...this.state, isTyping };
    this.notify();
  }

  setConnectionStatus(status: ConnectionStatus): void {
    this.state = { ...this.state, connectionStatus: status };
    this.notify();
  }

  setThemeMode(mode: "light" | "dark"): void {
    this.state = { ...this.state, themeMode: mode };
    this.notify();
  }

  toggleThemeMode(): void {
    const newMode = this.state.themeMode === "light" ? "dark" : "light";
    this.setThemeMode(newMode);
  }

  toggleAppMode(): void {
    const newMode: AppMode = this.state.appMode === "plan" ? "build" : "plan";
    this.state = { ...this.state, appMode: newMode };
    this.notify();
  }

  setCurrentModel(model: string): void {
    this.state = { ...this.state, currentModel: model };
    this.notify();
  }

  setCurrentThemeName(themeName: string): void {
    this.state = { ...this.state, currentThemeName: themeName };
    this.notify();
  }
}

export const store = new StateStore();
