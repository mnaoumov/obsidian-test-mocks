// eslint-disable-next-line capitalized-comments -- dprint-ignore directive must be lowercase.
// dprint-ignore -- Alias sort order differs from original name order.
import type {
  MenuItem as MenuItemOriginal,
  Menu as MenuOriginal,
  MenuPositionDef as MenuPositionDefOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';
import { MenuItem } from './MenuItem.ts';

export class Menu extends Component {
  public dom__: HTMLElement;
  public items__: MenuItem[] = [];

  private _onHideCallback: (() => unknown) | null = null;

  protected constructor() {
    super();
    this.dom__ = createDiv();
  }

  public static override create__(): Menu {
    return strictMock(new Menu());
  }

  public static forEvent(_evt: MouseEvent | PointerEvent): Menu {
    return Menu.create__();
  }

  public addItem(cb: (item: MenuItemOriginal) => unknown): this {
    const item = MenuItem.create__(this);
    this.items__.push(item);
    cb(castTo<MenuItemOriginal>(item));
    return this;
  }

  public addSeparator(): this {
    return this;
  }

  public override asOriginalType__(): MenuOriginal {
    return castTo<MenuOriginal>(this);
  }

  public close(): void {
    this._onHideCallback?.();
  }

  public hide(): this {
    return this;
  }

  public onHide(callback: () => unknown): void {
    this._onHideCallback = callback;
  }

  public setNoIcon(): this {
    return this;
  }

  public setUseNativeMenu(_useNativeMenu: boolean): this {
    return this;
  }

  public showAtMouseEvent(_evt: MouseEvent): this {
    return this;
  }

  public showAtPosition(_position: MenuPositionDefOriginal, _doc?: Document): this {
    return this;
  }
}
