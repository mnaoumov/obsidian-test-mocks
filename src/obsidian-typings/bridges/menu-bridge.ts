import type {
  MenuItem as MenuItemOriginal,
  Menu as MenuOriginal,
  MenuSeparator as MenuSeparatorOriginal
} from 'obsidian';

import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { Menu } from '../../obsidian/Menu.ts';

const ITEMS_NAME = 'items';
const SET_SECTION_SUBMENU_NAME = 'setSectionSubmenu';

/**
 * The `obsidian-typings` shape of a section's submenu, as passed by callers such as
 * `obsidian-dev-utils`' `AbstractFileCommandHandler`.
 */
interface SectionSubmenuConfig {
  readonly icon: string;
  readonly title: string;
}

/**
 * Exposes the `obsidian-typings` members of `Menu` that the mock models under a different name, so
 * production code reading them can be unit-tested. Without this the strict proxy throws on the read
 * rather than returning `undefined`, which is what made `menu.items` untestable.
 *
 * `items` is a getter over the mock's own `items__`. NOTE that `Menu.addSeparator()` is a no-op in the
 * mock, so `items` never contains a `MenuSeparator` even though the real member can — a suite asserting
 * on separators needs the mock to record them first (see [[T344-P35]]).
 */
export function bridgeMenu(): void {
  defineMissingProperty(Menu.prototype, ITEMS_NAME, {
    get(this: Menu): (MenuItemOriginal | MenuSeparatorOriginal)[] {
      return this.items__.map((item) => item.asOriginalType__());
    }
  });

  defineMissingProperty(Menu.prototype, SET_SECTION_SUBMENU_NAME, {
    value(this: Menu, section: string, config: SectionSubmenuConfig): MenuOriginal {
      this.sectionSubmenus__.set(section, config);
      return this.asOriginalType2__();
    },
    writable: true
  });
}

export function unbridgeMenu(): void {
  deleteMissingProperty(Menu.prototype, ITEMS_NAME);
  deleteMissingProperty(Menu.prototype, SET_SECTION_SUBMENU_NAME);
}
