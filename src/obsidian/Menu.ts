import type {
  MenuItem as MenuItemOriginal,
  Menu as MenuOriginal,
  MenuPositionDef as MenuPositionDefOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';
// eslint-disable-next-line import-x/no-cycle -- Cannot break the circular dependency.
import { MenuItem } from './MenuItem.ts';
import { MenuSeparator } from './MenuSeparator.ts';

/**
 * A section's submenu, as recorded by the bridged `Menu.setSectionSubmenu`.
 */
export interface SectionSubmenu__ {
  readonly icon: string;
  readonly title: string;
}

export class Menu extends Component {
  public dom__: HTMLElement;
  public items__: (MenuItem | MenuSeparator)[] = [];
  public sectionSubmenus__ = new Map<string, SectionSubmenu__>();

  /**
   * The added items, separators excluded.
   *
   * `items__` mirrors the real `Menu.items` and so holds both kinds. Nearly every reader wants only the
   * items — it is reading `title__` or `submenu__`, which a separator does not have — so this saves
   * narrowing at each read. Use `items__` when the separators themselves matter (asserting on their
   * positions, or on a count that has to match what Obsidian reports).
   */
  public get menuItems__(): MenuItem[] {
    return this.items__.filter((item) => item instanceof MenuItem);
  }

  private onHideCallback: (() => unknown) | null = null;

  protected constructor() {
    super();
    this.dom__ = createDiv();
    const self = strictProxy(this);
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
    return strictProxy(value, Menu);
  }

  public addItem(cb: (item: MenuItemOriginal) => unknown): this {
    const item = MenuItem.create__(this);
    this.items__.push(item);
    cb(item.asOriginalType__());
    return this;
  }

  public addSeparator(): this {
    this.items__.push(MenuSeparator.create__(this));
    return this;
  }

  public asOriginalType2__(): MenuOriginal {
    return strictProxy<MenuOriginal>(this);
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

  public setParentElement(_el: HTMLElement): this {
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
