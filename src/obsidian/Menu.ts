import type {
  MenuItem as MenuItemOriginal,
  Menu as MenuOriginal,
  // eslint-disable-next-line unicorn/name-replacements -- `MenuPositionDef` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  MenuPositionDef as MenuPositionDefOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';
// eslint-disable-next-line import-x/no-cycle -- Cannot break the circular dependency.
import { MenuItem } from './MenuItem.ts';
import { MenuSeparator } from './MenuSeparator.ts';

/**
 * A section's submenu, as recorded by `Menu.setSectionSubmenu`.
 */
export interface SectionSubmenu__ {
  readonly icon: string;
  readonly title: string;
}

export class Menu extends Component {
  public dom: HTMLElement;
  public items: (MenuItem | MenuSeparator)[] = [];
  public sectionSubmenus__ = new Map<string, SectionSubmenu__>();

  /**
   * The added items, separators excluded.
   *
   * `items` is Obsidian's own member and so holds both kinds. Nearly every reader wants only the
   * items — it is reading `title__` or `submenu`, which a separator does not have — so this saves
   * narrowing at each read. Use `items` when the separators themselves matter (asserting on their
   * positions, or on a count that has to match what Obsidian reports).
   */
  public get menuItems__(): MenuItem[] {
    return this.items.filter((item) => item instanceof MenuItem);
  }

  private onHideCallback: (() => unknown) | null = null;

  protected constructor() {
    super();
    this.dom = createDiv();
    const self = strictProxy(this);
    self.constructor2__();
    return self;
  }

  public static create2__(): Menu {
    return new Menu();
  }

  public static forEvent(_event: MouseEvent | PointerEvent): Menu {
    return Menu.create2__();
  }

  public static fromOriginalType2__(value: MenuOriginal): Menu {
    return strictProxy(value, Menu);
  }

  public addItem(callback: (item: MenuItemOriginal) => unknown): this {
    const item = MenuItem.create__(this);
    this.items.push(item);
    callback(item.asOriginalType__());
    return this;
  }

  public addSeparator(): this {
    this.items.push(MenuSeparator.create__(this));
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

  /**
   * Records a section's submenu configuration.
   *
   * Obsidian keys these by section name and renders the section as a submenu; the mock only has to
   * remember what was asked for, which is what callers such as `obsidian-dev-utils`'
   * `AbstractFileCommandHandler` assert on. Read the recorded configs back through
   * `sectionSubmenus__`.
   *
   * @param section - The section name.
   * @param config - The submenu's icon and title.
   * @returns This menu, for chaining.
   */
  public setSectionSubmenu(section: string, config: SectionSubmenu__): this {
    this.sectionSubmenus__.set(section, config);
    return this;
  }

  public setUseNativeMenu(_useNativeMenu: boolean): this {
    return this;
  }

  public showAtMouseEvent(_event: MouseEvent): this {
    return this;
  }

  public showAtPosition(_position: MenuPositionDefOriginal, _doc?: Document): this {
    return this;
  }
}
