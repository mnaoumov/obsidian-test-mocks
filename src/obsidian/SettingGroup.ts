import type {
  ExtraButtonComponent,
  SearchComponent,
  Setting
} from 'obsidian';

import { strictMock } from '../internal/StrictMock.ts';

export class SettingGroup {
  public listEl: HTMLElement = createDiv();

  public constructor(containerEl: HTMLElement) {
    containerEl.appendChild(this.listEl);
    SettingGroup.__constructor(this, containerEl);
    return strictMock(this);
  }

  public static __constructor(_instance: SettingGroup, _containerEl: HTMLElement): void {
    // Spy hook.
  }

  public addClass(cls: string): this {
    this.listEl.classList.add(cls);
    return this;
  }

  public addExtraButton(_cb: (component: ExtraButtonComponent) => unknown): this {
    return this;
  }

  public addSearch(_cb: (component: SearchComponent) => unknown): this {
    return this;
  }

  public addSetting(_cb: (setting: Setting) => void): this {
    return this;
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
