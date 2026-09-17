/**
 * @file
 *
 * Mock of Obsidian's `Menu`, the context menu built from items and separators.
 */

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

/**
 * Mock of Obsidian's `Menu`.
 *
 * Nothing is shown: added items and separators are collected in {@link Menu.items} so a test can inspect them and
 * invoke their click handlers, and the show and configuration methods only return the menu for chaining.
 */
export class Menu extends Component {
  /**
   * The menu's root element; detached in the mock.
   */
  public dom: HTMLElement;

  /**
   * The menu's items and separators, in the order they were added.
   */
  public items: (MenuItem | MenuSeparator)[] = [];

  /**
   * Mock-only: the submenu configuration recorded for each section by {@link Menu.setSectionSubmenu}, keyed by
   * section name.
   */
  public sectionSubmenus__ = new Map<string, SectionSubmenu__>();

  /**
   * The added items, separators excluded.
   *
   * `items` is Obsidian's own member and so holds both kinds. Nearly every reader wants only the
   * items — it is reading `title__` or `submenu`, which a separator does not have — so this saves
   * narrowing at each read. Use `items` when the separators themselves matter (asserting on their
   * positions, or on a count that has to match what Obsidian reports).
   *
   * @returns The menu items, in the order they were added.
   */
  public get menuItems__(): MenuItem[] {
    return this.items.filter((item) => item instanceof MenuItem);
  }

  private onHideCallback: (() => unknown) | null = null;

  /**
   * Creates an empty menu. Use {@link Menu.create2__} from tests.
   */
  protected constructor() {
    super();
    this.dom = createDiv();
    const self = strictProxy(this);
    self.constructor2__();
    return self;
  }

  /**
   * Mock-only factory: creates a menu, spyable via `vi.spyOn(Menu, 'create2__')`. The subclass variant of
   * {@link Component.create__}.
   *
   * @returns The new menu.
   */
  public static create2__(): Menu {
    return new Menu();
  }

  /**
   * Creates a menu for a mouse or pointer event, choosing the native or DOM menu to suit how it was triggered.
   *
   * The mock ignores the event and returns a new menu.
   *
   * @param _event - The event that opens the menu.
   * @returns The new menu.
   */
  public static forEvent(_event: MouseEvent | PointerEvent): Menu {
    return Menu.create2__();
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Menu` as this mock.
   *
   * @param value - The value typed as the original `Menu`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: MenuOriginal): Menu {
    return strictProxy(value, Menu);
  }

  /**
   * Adds a menu item. Obsidian only allows this before the menu is shown; the mock allows it at any time.
   *
   * @param callback - Called right away with the new item, to configure it.
   * @returns This menu, for chaining.
   */
  public addItem(callback: (item: MenuItemOriginal) => unknown): this {
    const item = MenuItem.create__(this);
    this.items.push(item);
    callback(item.asOriginalType__());
    return this;
  }

  /**
   * Adds a separator. Obsidian only allows this before the menu is shown; the mock allows it at any time.
   *
   * @returns This menu, for chaining.
   */
  public addSeparator(): this {
    this.items.push(MenuSeparator.create__(this));
    return this;
  }

  /**
   * Mock-only: views this mock as Obsidian's `Menu` type.
   *
   * @returns The same object, typed as the original `Menu`.
   */
  public asOriginalType2__(): MenuOriginal {
    return strictProxy<MenuOriginal>(this);
  }

  /**
   * Closes the menu. The mock calls the callback registered with {@link Menu.onHide}, if any.
   */
  public close(): void {
    this.onHideCallback?.();
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Menu.prototype, 'constructor2__')`.
   */
  public constructor2__(): void {
    noop();
  }

  /**
   * Hides the menu. The mock does nothing, and unlike {@link Menu.close} does not call the hide callback.
   *
   * @returns This menu, for chaining.
   */
  public hide(): this {
    return this;
  }

  /**
   * Registers a callback to run when the menu is hidden. The mock keeps only the latest callback, and runs it from
   * {@link Menu.close}.
   *
   * @param callback - The callback to run.
   */
  public onHide(callback: () => unknown): void {
    this.onHideCallback = callback;
  }

  /**
   * Makes the menu reserve no space for item icons. A no-op in the mock.
   *
   * @returns This menu, for chaining.
   */
  public setNoIcon(): this {
    return this;
  }

  /**
   * Sets the element the menu is attached to. A no-op in the mock.
   *
   * @param _el - The parent element.
   * @returns This menu, for chaining.
   */
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

  /**
   * Forces the menu to use the native OS menu or the DOM menu (desktop only). A no-op in the mock.
   *
   * @param _useNativeMenu - Whether to use the native menu.
   * @returns This menu, for chaining.
   */
  public setUseNativeMenu(_useNativeMenu: boolean): this {
    return this;
  }

  /**
   * Shows the menu at a mouse event's position. A no-op in the mock.
   *
   * @param _event - The mouse event to position the menu at.
   * @returns This menu, for chaining.
   */
  public showAtMouseEvent(_event: MouseEvent): this {
    return this;
  }

  /**
   * Shows the menu at a position. A no-op in the mock.
   *
   * @param _position - The coordinates, and optional alignment, to show the menu at.
   * @param _doc - The document to show the menu in, for popout windows.
   * @returns This menu, for chaining.
   */
  public showAtPosition(_position: MenuPositionDefOriginal, _doc?: Document): this {
    return this;
  }
}
