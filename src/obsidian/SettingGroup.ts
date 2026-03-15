import type {
  ExtraButtonComponent as ExtraButtonComponentOriginal,
  SearchComponent as SearchComponentOriginal,
  SettingGroup as SettingGroupOriginal,
  Setting as SettingOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ExtraButtonComponent as MockExtraButtonComponent } from './ExtraButtonComponent.ts';
import { SearchComponent as MockSearchComponent } from './SearchComponent.ts';
import { Setting } from './Setting.ts';

export class SettingGroup {
  public listEl__: HTMLDivElement;

  public constructor(containerEl: HTMLElement) {
    this.listEl__ = createDiv();
    containerEl.appendChild(this.listEl__);
    const self = strictMock(this);
    self.constructor__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): SettingGroup {
    return new SettingGroup(containerEl);
  }

  public addClass(cls: string): this {
    this.listEl__.classList.add(cls);
    return this;
  }

  public addExtraButton(cb: (component: ExtraButtonComponentOriginal) => unknown): this {
    const comp = MockExtraButtonComponent.create__(this.listEl__);
    cb(castTo<ExtraButtonComponentOriginal>(comp));
    return this;
  }

  public addSearch(cb: (component: SearchComponentOriginal) => unknown): this {
    const comp = MockSearchComponent.create__(this.listEl__);
    cb(castTo<SearchComponentOriginal>(comp));
    return this;
  }

  public addSetting(cb: (setting: SettingOriginal) => void): this {
    const setting = Setting.create__(this.listEl__);
    cb(castTo<SettingOriginal>(setting));
    return this;
  }

  public asOriginalType__(): SettingGroupOriginal {
    return castTo<SettingGroupOriginal>(this);
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
