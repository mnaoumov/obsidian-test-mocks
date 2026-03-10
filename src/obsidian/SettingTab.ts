import type { SettingTab as SettingTabOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement;

  public constructor(app: App) {
    this.app = app;
    this.containerEl = createDiv();
    const self = strictMock(this);
    self.constructor__(app);
    return self;
  }

  public asOriginalType__(): SettingTabOriginal {
    return castTo<SettingTabOriginal>(this);
  }

  public constructor__(_app: App): void {
    noop();
  }

  public abstract display(): void;

  public hide(): void {
    this.containerEl.innerHTML = '';
  }
}
