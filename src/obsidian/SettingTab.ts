import type {
  IconName as IconNameOriginal,
  Setting as SettingOriginal,
  SettingTab as SettingTabOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement;
  public icon: IconNameOriginal = '';

  public constructor(app: App, setting?: SettingOriginal) {
    this.app = app;
    this.containerEl = createDiv();
    const self = strictProxy(this);
    self.constructor__(app, setting);
    return self;
  }

  public static fromOriginalType__(value: SettingTabOriginal): SettingTab {
    return strictProxy(value, SettingTab);
  }

  public asOriginalType__(): SettingTabOriginal {
    return strictProxy<SettingTabOriginal>(this);
  }

  public constructor__(_app: App, _setting?: SettingOriginal): void {
    noop();
  }

  public abstract display(): void;

  public hide(): void {
    this.containerEl.innerHTML = '';
  }
}
