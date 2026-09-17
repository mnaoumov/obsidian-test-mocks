/**
 * @file
 *
 * Mock of Obsidian's `MenuSeparator`, the divider between groups of menu items.
 */

import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import type { Menu } from './Menu.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `MenuSeparator`. It has no state of its own; it only marks a position in `Menu.items`.
 */
export class MenuSeparator {
  /**
   * Creates a separator for a menu. Use {@link MenuSeparator.create__} from tests.
   *
   * @param menu - The menu the separator belongs to; not stored by the mock.
   */
  protected constructor(menu: Menu) {
    const self = strictProxy(this);
    self.constructor__(menu);
    return self;
  }

  /**
   * Mock-only factory: creates a menu separator, spyable via `vi.spyOn(MenuSeparator, 'create__')`.
   *
   * @param menu - The menu the separator belongs to.
   * @returns The new menu separator.
   */
  public static create__(menu: Menu): MenuSeparator {
    return new MenuSeparator(menu);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MenuSeparator` as this mock.
   *
   * @param value - The value typed as the original `MenuSeparator`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: MenuSeparatorOriginal): MenuSeparator {
    return strictProxy(value, MenuSeparator);
  }

  /**
   * Mock-only: views this mock as Obsidian's `MenuSeparator` type.
   *
   * @returns The same object, typed as the original `MenuSeparator`.
   */
  public asOriginalType__(): MenuSeparatorOriginal {
    return strictProxy<MenuSeparatorOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MenuSeparator.prototype, 'constructor__')`.
   *
   * @param _menu - The menu the separator was created with.
   */
  public constructor__(_menu: Menu): void {
    noop();
  }
}
