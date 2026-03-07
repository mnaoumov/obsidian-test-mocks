import type { IconName } from 'obsidian';

import { noop } from '../internal/Noop.ts';
import { Menu } from './Menu.ts';

export class MenuItem {
  public onClick(_callback: (evt: KeyboardEvent | MouseEvent) => unknown): this {
    return this;
  }

  public setChecked(_checked: boolean | null): this {
    return this;
  }

  public setDisabled(_disabled: boolean): this {
    return this;
  }

  public setIcon(_icon: IconName | null): this {
    return this;
  }

  public setIsLabel(_isLabel: boolean): this {
    return this;
  }

  public setSection(_section: string): this {
    return this;
  }

  public setSubmenu(): Menu {
    return new Menu();
  }

  public setTitle(_title: DocumentFragment | string): this {
    return this;
  }

  public setWarning(_isWarning: boolean): this {
    return this;
  }
}
