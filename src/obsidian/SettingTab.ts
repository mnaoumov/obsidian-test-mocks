import type { App } from './App.ts';

import { noop } from '../internal/Noop.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement = createDiv();

  public constructor(app: App) {
    this.app = app;
  }

  public abstract display(): void;

  public hide(): void {
    noop();
  }
}
