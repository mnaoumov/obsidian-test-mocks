import type {
  IconName,
  MenuItem as MenuItemOriginal
} from 'obsidian';

import type { Menu } from './Menu.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class MenuItem {
  public checked__: boolean | null = null;
  public disabled__ = false;
  public icon__: IconName | null = null;
  public isLabel__ = false;
  public onClick__: ((evt: KeyboardEvent | MouseEvent) => unknown) | null = null;
  public section__ = '';
  public title__: DocumentFragment | string = '';
  public warning__ = false;

  private constructor(_menu: unknown) {
    const mock = strictMock(this);
    return mock;
  }

  public static create__(menu: unknown): MenuItem {
    return new MenuItem(menu);
  }

  public asOriginalType__(): MenuItemOriginal {
    return castTo<MenuItemOriginal>(this);
  }

  public onClick(callback: (evt: KeyboardEvent | MouseEvent) => unknown): this {
    this.onClick__ = callback;
    return this;
  }

  public setChecked(checked: boolean | null): this {
    this.checked__ = checked;
    return this;
  }

  public setDisabled(disabled: boolean): this {
    this.disabled__ = disabled;
    return this;
  }

  public setIcon(icon: IconName | null): this {
    this.icon__ = icon;
    return this;
  }

  public setIsLabel(isLabel: boolean): this {
    this.isLabel__ = isLabel;
    return this;
  }

  public setSection(section: string): this {
    this.section__ = section;
    return this;
  }

  public setSubmenu(): Menu {
    // Lazy import to break circular dependency (Menu <-> MenuItem).
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Required to break import cycle synchronously.
    const { Menu: MenuClass } = require('./Menu.ts') as typeof import('./Menu.ts');
    return MenuClass.create__();
  }

  public setTitle(title: DocumentFragment | string): this {
    this.title__ = title;
    return this;
  }

  public setWarning(isWarning: boolean): this {
    this.warning__ = isWarning;
    return this;
  }
}
