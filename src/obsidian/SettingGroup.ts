// eslint-disable-next-line capitalized-comments -- dprint-ignore directive must be lowercase.
// dprint-ignore -- Alias sort order differs from original name order.
import type {
  ExtraButtonComponent,
  Setting as ObsidianSetting,
  SearchComponent,
  SettingGroup as SettingGroupOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ExtraButtonComponent as MockExtraButtonComponent } from './ExtraButtonComponent.ts';
import { SearchComponent as MockSearchComponent } from './SearchComponent.ts';
import { Setting } from './Setting.ts';

export class SettingGroup {
  public listEl__: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    this.listEl__ = createDiv();
    containerEl.appendChild(this.listEl__);
  }

  public static create__(containerEl: HTMLElement): SettingGroup {
    return strictMock(new SettingGroup(containerEl));
  }

  public addClass(cls: string): this {
    this.listEl__.classList.add(cls);
    return this;
  }

  public addExtraButton(cb: (component: ExtraButtonComponent) => unknown): this {
    const comp = MockExtraButtonComponent.create__(this.listEl__);
    cb(castTo<ExtraButtonComponent>(comp));
    return this;
  }

  public addSearch(cb: (component: SearchComponent) => unknown): this {
    const comp = MockSearchComponent.create__(this.listEl__);
    cb(castTo<SearchComponent>(comp));
    return this;
  }

  public addSetting(cb: (setting: ObsidianSetting) => void): this {
    const setting = Setting.create__(this.listEl__);
    cb(castTo<ObsidianSetting>(setting));
    return this;
  }

  public asOriginalType__(): SettingGroupOriginal {
    return castTo<SettingGroupOriginal>(this);
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
