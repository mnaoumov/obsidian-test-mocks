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
  public groupEl__: HTMLDivElement;
  public listEl: HTMLDivElement;
  private readonly headerEl: HTMLDivElement;
  private readonly headerInnerEl: HTMLDivElement;

  public constructor(containerEl: HTMLElement) {
    this.groupEl__ = containerEl.createDiv();
    this.headerEl = createDiv();
    this.headerInnerEl = this.headerEl.createDiv();
    this.listEl = this.groupEl__.createDiv();
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

  public addClass(...classes: string[]): this {
    this.listEl.classList.add(...classes);
    return this;
  }

  public addExtraButton(callback: (component: ExtraButtonComponentOriginal) => unknown): this {
    const comp = ExtraButtonComponent.create__(this.listEl);
    callback(comp.asOriginalType2__());
    return this;
  }

  public addSearch(callback: (component: SearchComponentOriginal) => unknown): this {
    const comp = SearchComponent.create__(this.listEl);
    callback(comp.asOriginalType4__());
    return this;
  }

  public addSetting(callback: (setting: SettingOriginal) => void): this {
    const setting = Setting.create__(this.listEl);
    callback(setting.asOriginalType__());
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
      this.groupEl__.prepend(this.headerEl);
    } else if (!text && this.headerEl.isShown()) {
      this.headerEl.detach();
    }

    return this;
  }
}
