import type { SettingTab as SettingTabOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

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

  public asOriginalType__(): SettingTabOriginal {
    return castTo<SettingTabOriginal>(this);
  }

  public abstract display(): void;

  public hide(): void {
    this.containerEl.innerHTML = '';
  }
}
