import type {
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

  public static __create(): Menu {
    return new Menu();
  }

  public static override __constructor(_instance: Menu): void {
    // Spy hook.
  }

  protected constructor() {
    super();
    this.dom = createDiv();
    Menu.__constructor(this);
    return strictMock(this);
  }

  public addItem(cb: (item: ObsidianMenuItem) => unknown): this {
    const item = MenuItem.__create();
    this._items.push(item);
    cb(castTo<ObsidianMenuItem>(item));
    return this;
  }

  public addSeparator(): this {
    return this;
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

  private _onHideCallback: (() => unknown) | null = null;

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

  public static forEvent(_evt: MouseEvent | PointerEvent): Menu {
    return Menu.__create();
  }
}
