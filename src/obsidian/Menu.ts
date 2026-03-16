import type {
  MenuItem as MenuItemOriginal,
  Menu as MenuOriginal,
  MenuPositionDef as MenuPositionDefOriginal
} from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { Component } from './Component.ts';
// eslint-disable-next-line import-x/no-cycle -- Cannot break the circular dependency.
import { MenuItem } from './MenuItem.ts';

export class Menu extends Component {
  public dom__: HTMLElement;
  public items__: MenuItem[] = [];

  private onHideCallback: (() => unknown) | null = null;

  protected constructor() {
    super();
    this.dom__ = createDiv();
    const self = createMockOfUnsafe(this);
    self.constructor2__();
    return self;
  }

  public static create2__(): Menu {
    return new Menu();
  }

  public static forEvent(_evt: MouseEvent | PointerEvent): Menu {
    return Menu.create2__();
  }

  public static fromOriginalType2__(value: MenuOriginal): Menu {
    return createMockOfUnsafe<Menu>(value);
  }

  public addItem(cb: (item: MenuItemOriginal) => unknown): this {
    const item = MenuItem.create__(this);
    this.items__.push(item);
    cb(item.asOriginalType__());
    return this;
  }

  public addSeparator(): this {
    return this;
  }

  public asOriginalType2__(): MenuOriginal {
    return createMockOfUnsafe<MenuOriginal>(this);
  }

  public close(): void {
    this.onHideCallback?.();
  }

  public constructor2__(): void {
    noop();
  }

  public hide(): this {
    return this;
  }

  public onHide(callback: () => unknown): void {
    this.onHideCallback = callback;
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
