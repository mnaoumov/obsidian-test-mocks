import type { SettingTab as RealSettingTab } from 'obsidian';

import type { App } from './App.ts';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement;

  public constructor(app: App) {
    this.app = app;
    this.containerEl = createDiv();
    const mock = strictMock(this);
    SettingTab.constructor__(mock, app);
    return mock;
  }

  public static constructor__(_instance: SettingTab, _app: App, ..._args: unknown[]): void {
    // Spy hook.
  }

  public abstract display(): void;

  public hide(): void {
    this.containerEl.innerHTML = '';
  }

  public asReal__(): RealSettingTab {
    return strictCastTo<RealSettingTab>(this);
  }
}
