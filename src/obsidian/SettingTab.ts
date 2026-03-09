import type { SettingTab as SettingTabOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement;

  public constructor(app: App) {
    this.app = app;
    this.containerEl = createDiv();
    return strictMock(this);
  }

  public asOriginalType__(): SettingTabOriginal {
    return castTo<SettingTabOriginal>(this);
  }

  public abstract display(): void;

  public hide(): void {
    this.containerEl.innerHTML = '';
  }
}
