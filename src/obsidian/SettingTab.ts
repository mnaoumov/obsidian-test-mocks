import type {
  IconName as IconNameOriginal,
  Setting as SettingOriginal,
  SettingTab as SettingTabOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export abstract class SettingTab {
  public app: App;
  public containerEl: HTMLDivElement;
  public icon: IconNameOriginal = '';

  public constructor(app: App, setting?: SettingOriginal) {
    this.app = app;
    this.containerEl = createDiv();
    const self = createMockOfUnsafe(this);
    self.constructor__(app, setting);
    return self;
  }

  public static fromOriginalType__(value: SettingTabOriginal): SettingTab {
    return createMockOfUnsafe<SettingTab>(value);
  }

  public asOriginalType__(): SettingTabOriginal {
    return createMockOfUnsafe<SettingTabOriginal>(this);
  }

  public constructor__(_app: App, _setting?: SettingOriginal): void {
    noop();
  }

  public abstract display(): void;

  public hide(): void {
    this.containerEl.innerHTML = '';
  }
}
