import type {
  Menu as MenuOriginal,
  MenuPositionDef,
  MenuItem as ObsidianMenuItem
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Component } from './Component.ts';
import { MenuItem } from './MenuItem.ts';

export class Menu extends Component {
  public _items: MenuItem[] = [];
  public dom: HTMLElement;

  private _onHideCallback: (() => unknown) | null = null;

  protected constructor() {
    super();
    this.dom = createDiv();
  }

  public static create__(): Menu {
    return strictMock(new Menu());
  }

  public static forEvent(_evt: MouseEvent | PointerEvent): Menu {
    return Menu.create__();
  }

  public addItem(cb: (item: ObsidianMenuItem) => unknown): this {
    const item = MenuItem.create__(this);
    this._items.push(item);
    cb(castTo<ObsidianMenuItem>(item));
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

  public showAtPosition(_position: MenuPositionDef, _doc?: Document): this {
    return this;
  }
}
