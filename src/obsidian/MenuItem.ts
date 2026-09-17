/**
 * @file
 *
 * Mock of Obsidian's `MenuItem`, one entry of a context menu.
 */

import type {
  IconName as IconNameOriginal,
  MenuItem as MenuItemOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
// eslint-disable-next-line import-x/no-cycle -- Cannot break the circular dependency.
import { Menu } from './Menu.ts';

/**
 * Mock of Obsidian's `MenuItem`.
 *
 * Every setter records its argument on a public field, so a test can read an item's title, icon, section and
 * state, and invoke {@link MenuItem.onClick__} to simulate a click.
 */
export class MenuItem {
  /**
   * The item's checked state: `true` or `false` for a checkbox item, `null` when it has no check mark.
   */
  public checked: boolean | null = null;

  /**
   * Whether the item is disabled.
   */
  public disabled = false;

  /**
   * Mock-only: the icon id set by {@link MenuItem.setIcon}, or `null` for none.
   */
  public icon__: IconNameOriginal | null = null;

  /**
   * Mock-only: whether {@link MenuItem.setIsLabel} marked the item as a non-clickable label.
   */
  public isLabel__ = false;

  /**
   * Mock-only: the click handler set by {@link MenuItem.onClick}, or `null` when none was set.
   */
  public onClick__: ((event: KeyboardEvent | MouseEvent) => unknown) | null = null;

  /**
   * The id of the menu section the item belongs to; empty when none was set.
   */
  public section = '';

  /**
   * The item's submenu, created by {@link MenuItem.setSubmenu}, or `null` when it has none.
   */
  public submenu: Menu | null = null;

  /**
   * Mock-only: the title set by {@link MenuItem.setTitle}.
   */
  public title__: DocumentFragment | string = '';

  /**
   * Mock-only: whether {@link MenuItem.setWarning} put the item in the warning (red) style.
   */
  public warning__ = false;

  private constructor(_menu: unknown) {
    const mock = strictProxy(this);
    return mock;
  }

  /**
   * Mock-only factory: creates a menu item, spyable via `vi.spyOn(MenuItem, 'create__')`. Obsidian's constructor
   * is private; items come from `Menu.addItem`.
   *
   * @param menu - The menu the item belongs to; not stored by the mock.
   * @returns The new menu item.
   */
  public static create__(menu: unknown): MenuItem {
    return new MenuItem(menu);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MenuItem` as this mock.
   *
   * @param value - The value typed as the original `MenuItem`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: MenuItemOriginal): MenuItem {
    return strictProxy(value, MenuItem);
  }

  /**
   * Mock-only: views this mock as Obsidian's `MenuItem` type.
   *
   * @returns The same object, typed as the original `MenuItem`.
   */
  public asOriginalType__(): MenuItemOriginal {
    return strictProxy<MenuItemOriginal>(this);
  }

  /**
   * Mock-only construction hook, meant for `vi.spyOn(MenuItem.prototype, 'constructor__')`; a no-op.
   *
   * Unlike the other mocks, the constructor does not call it.
   *
   * @param _menu - The menu the item belongs to.
   */
  public constructor__(_menu: unknown): void {
    noop();
  }

  /**
   * Sets the handler run when the item is clicked or chosen with the keyboard. The mock stores it in
   * {@link MenuItem.onClick__} and never calls it.
   *
   * @param callback - The click handler.
   * @returns This item, for chaining.
   */
  public onClick(callback: (event: KeyboardEvent | MouseEvent) => unknown): this {
    this.onClick__ = callback;
    return this;
  }

  /**
   * Sets whether the item shows a check mark.
   *
   * @param checked - `true` or `false` for a checkbox item, `null` to show no check mark.
   * @returns This item, for chaining.
   */
  public setChecked(checked: boolean | null): this {
    this.checked = checked;
    return this;
  }

  /**
   * Enables or disables the item.
   *
   * @param disabled - Whether the item is disabled.
   * @returns This item, for chaining.
   */
  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }

  /**
   * Sets the item's icon.
   *
   * @param icon - The id of an icon added with `addIcon` or from the built-in Lucide set, or `null` for none.
   * @returns This item, for chaining.
   */
  public setIcon(icon: IconNameOriginal | null): this {
    this.icon__ = icon;
    return this;
  }

  /**
   * Sets whether the item is a label rather than a clickable entry.
   *
   * @param isLabel - Whether the item is a label.
   * @returns This item, for chaining.
   */
  public setIsLabel(isLabel: boolean): this {
    this.isLabel__ = isLabel;
    return this;
  }

  /**
   * Sets the menu section the item belongs in. Existing section ids can be found in the `data-section` attribute
   * of a real menu's elements.
   *
   * @param section - The section id.
   * @returns This item, for chaining.
   */
  public setSection(section: string): this {
    this.section = section;
    return this;
  }

  /**
   * Turns the item into a submenu entry.
   *
   * @returns The item's submenu, created on the first call and reused afterwards.
   */
  public setSubmenu(): Menu {
    this.submenu ??= Menu.create2__();
    return this.submenu;
  }

  /**
   * Sets the item's title.
   *
   * @param title - The title, as text or as a fragment.
   * @returns This item, for chaining.
   */
  public setTitle(title: DocumentFragment | string): this {
    this.title__ = title;
    return this;
  }

  /**
   * Sets whether the item is shown in the warning style, which colors its title and icon red.
   *
   * @param isWarning - Whether the warning style is on.
   * @returns This item, for chaining.
   */
  public setWarning(isWarning: boolean): this {
    this.warning__ = isWarning;
    return this;
  }
}
