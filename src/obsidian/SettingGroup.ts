import type {
  ExtraButtonComponent as ExtraButtonComponentOriginal,
  SearchComponent as SearchComponentOriginal,
  SettingGroup as SettingGroupOriginal,
  Setting as SettingOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ExtraButtonComponent } from './ExtraButtonComponent.ts';
import { SearchComponent } from './SearchComponent.ts';
import { Setting } from './Setting.ts';

export class SettingGroup {
  public listEl__: HTMLDivElement;
  private readonly groupEl: HTMLDivElement;
  private readonly headerEl: HTMLDivElement;
  private readonly headerInnerEl: HTMLDivElement;

  public constructor(containerEl: HTMLElement) {
    this.groupEl = containerEl.createDiv();
    this.headerEl = createDiv();
    this.headerInnerEl = this.headerEl.createDiv();
    this.listEl__ = this.groupEl.createDiv();
    const self = strictProxy(this);
    self.constructor__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): SettingGroup {
    return new SettingGroup(containerEl);
  }

  public static fromOriginalType__(value: SettingGroupOriginal): SettingGroup {
    return strictProxy(value, SettingGroup);
  }

  public addClass(cls: string): this {
    this.listEl__.classList.add(cls);
    return this;
  }

  public addExtraButton(cb: (component: ExtraButtonComponentOriginal) => unknown): this {
    const comp = ExtraButtonComponent.create__(this.listEl__);
    cb(comp.asOriginalType2__());
    return this;
  }

  public addSearch(cb: (component: SearchComponentOriginal) => unknown): this {
    const comp = SearchComponent.create__(this.listEl__);
    cb(comp.asOriginalType4__());
    return this;
  }

  public addSetting(cb: (setting: SettingOriginal) => void): this {
    const setting = Setting.create__(this.listEl__);
    cb(setting.asOriginalType__());
    return this;
  }

  public asOriginalType__(): SettingGroupOriginal {
    return strictProxy<SettingGroupOriginal>(this);
  }

  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }

  public setHeading(text: DocumentFragment | string): this {
    this.headerInnerEl.setText(text);

    if (text && !this.headerEl.isShown()) {
      this.groupEl.prepend(this.headerEl);
    } else if (!text && this.headerEl.isShown()) {
      this.headerEl.detach();
    }

    return this;
  }
}
