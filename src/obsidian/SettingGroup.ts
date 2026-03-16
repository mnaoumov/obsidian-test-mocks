import type {
  ExtraButtonComponent as ExtraButtonComponentOriginal,
  SearchComponent as SearchComponentOriginal,
  SettingGroup as SettingGroupOriginal,
  Setting as SettingOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { ExtraButtonComponent } from './ExtraButtonComponent.ts';
import { SearchComponent } from './SearchComponent.ts';
import { Setting } from './Setting.ts';

export class SettingGroup {
  public listEl__: HTMLDivElement;

  public constructor(containerEl: HTMLElement) {
    this.listEl__ = createDiv();
    containerEl.appendChild(this.listEl__);
    const self = strictProxyForce(this);
    self.constructor__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): SettingGroup {
    return new SettingGroup(containerEl);
  }

  public static fromOriginalType__(value: SettingGroupOriginal): SettingGroup {
    return strictProxyForce(value, SettingGroup);
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
    return strictProxyForce<SettingGroupOriginal>(this);
  }

  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }

  public setHeading(text: DocumentFragment | string): this {
    if (typeof text === 'string') {
      const heading = createEl('h3');
      heading.textContent = text;
      this.listEl__.prepend(heading);
    }
    return this;
  }
}
