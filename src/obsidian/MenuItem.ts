import type { IconName } from 'obsidian';

import { strictMock } from '../internal/StrictMock.ts';
import { Menu } from './Menu.ts';

export class MenuItem {
  public _checked: boolean | null = null;
  public _disabled = false;
  public _icon: IconName | null = null;
  public _isLabel = false;
  public _onClick: ((evt: KeyboardEvent | MouseEvent) => unknown) | null = null;
  public _section = '';
  public _title: DocumentFragment | string = '';
  public _warning = false;

  private constructor() {
    const mock = strictMock(this);
    MenuItem.constructor__(mock);
    return mock;
  }

  public static constructor__(_instance: MenuItem): void {
    // Spy hook.
  }

  public static create__(_menu?: unknown): MenuItem {
    return new MenuItem();
  }

  public onClick(callback: (evt: KeyboardEvent | MouseEvent) => unknown): this {
    this._onClick = callback;
    return this;
  }

  public setChecked(checked: boolean | null): this {
    this._checked = checked;
    return this;
  }

  public setDisabled(disabled: boolean): this {
    this._disabled = disabled;
    return this;
  }

  public setIcon(icon: IconName | null): this {
    this._icon = icon;
    return this;
  }

  public setIsLabel(isLabel: boolean): this {
    this._isLabel = isLabel;
    return this;
  }

  public setSection(section: string): this {
    this._section = section;
    return this;
  }

  public setSubmenu(): Menu {
    return Menu.create__();
  }

  public setTitle(title: DocumentFragment | string): this {
    this._title = title;
    return this;
  }

  public setWarning(isWarning: boolean): this {
    this._warning = isWarning;
    return this;
  }
}
