import type { App } from './App.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement = createDiv();

  public constructor(app: App) {
    this.app = app;
    SettingTab.__constructor(this, app);
  }

  public static __constructor(_instance: SettingTab, _app: App, ..._args: unknown[]): void {
    // Spy hook.
  }

  public abstract display(): void;

  public hide(): void {
    this.containerEl.innerHTML = '';
  }
}
