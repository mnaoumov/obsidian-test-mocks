import type {
  IconName as IconNameOriginal,
  MenuItem as MenuItemOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
// eslint-disable-next-line import-x/no-cycle -- Cannot break the circular dependency.
import { Menu } from './Menu.ts';

export class MenuItem {
  public checked__: boolean | null = null;
  public disabled__ = false;
  public icon__: IconNameOriginal | null = null;
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

  public constructor__(_menu: unknown): void {
    noop();
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

  public setIcon(icon: IconNameOriginal | null): this {
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
    return Menu.create2__();
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
