import type { Menu as MenuOriginal } from 'obsidian';

import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { MenuItem } from '../../obsidian/MenuItem.ts';

const SET_SUBMENU_NAME = 'setSubmenu';
const SUBMENU_NAME = 'submenu';

export function bridgeMenuItem(): void {
  defineMissingProperty(MenuItem.prototype, SET_SUBMENU_NAME, {
    value(this: MenuItem): MenuOriginal {
      return this.setSubmenu__().asOriginalType2__();
    },
    writable: true
  });

  defineMissingProperty(MenuItem.prototype, SUBMENU_NAME, {
    get(this: MenuItem): MenuOriginal | null {
      return this.submenu__?.asOriginalType2__() ?? null;
    }
  });
}

export function unbridgeMenuItem(): void {
  deleteMissingProperty(MenuItem.prototype, SET_SUBMENU_NAME);
  deleteMissingProperty(MenuItem.prototype, SUBMENU_NAME);
}
