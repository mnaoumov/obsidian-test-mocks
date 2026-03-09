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
  public listEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    this.listEl = createDiv();
    containerEl.appendChild(this.listEl);
    return strictMock(this);
  }

  public addClass(cls: string): this {
    this.listEl.classList.add(cls);
    return this;
  }

  public addExtraButton(cb: (component: ExtraButtonComponent) => unknown): this {
    const comp = new MockExtraButtonComponent(this.listEl);
    cb(castTo<ExtraButtonComponent>(comp));
    return this;
  }

  public addSearch(cb: (component: SearchComponent) => unknown): this {
    const comp = new MockSearchComponent(this.listEl);
    cb(castTo<SearchComponent>(comp));
    return this;
  }

  public addSetting(cb: (setting: ObsidianSetting) => void): this {
    const setting = new Setting(this.listEl);
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
      this.listEl.prepend(heading);
    }
    return this;
  }
}
