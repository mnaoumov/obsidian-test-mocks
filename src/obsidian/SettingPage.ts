import type { SettingPage as SettingPageOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export abstract class SettingPage {
  public containerEl: HTMLElement;
  public rootEl: HTMLElement;
  public title = '';
  public titlebarEl: HTMLElement;

  public constructor() {
    this.rootEl = createDiv();
    this.titlebarEl = this.rootEl.createDiv();
    this.containerEl = this.rootEl.createDiv();
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  public static fromOriginalType__(value: SettingPageOriginal): SettingPage {
    return strictProxy(value, SettingPage);
  }

  public asOriginalType__(): SettingPageOriginal {
    return strictProxy<SettingPageOriginal>(this);
  }

  public constructor__(): void {
    noop();
  }

  public abstract display(): void;

  public hide(): void {
    noop();
  }
}
