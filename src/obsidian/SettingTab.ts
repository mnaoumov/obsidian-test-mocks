import type { App } from './App.ts';

import { strictMock } from '../internal/StrictMock.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement;

  public constructor(app: App) {
    this.app = app;
    this.containerEl = createDiv();
    const mock = strictMock(this);
    SettingTab.__constructor(mock, app);
    return mock;
  }

  public static __constructor(_instance: SettingTab, _app: App, ..._args: unknown[]): void {
    // Spy hook.
  }

  public abstract display(): void;

  public hide(): void {
    this.containerEl.innerHTML = '';
  }
}
