import type { IconName } from 'obsidian';

import { strictMock } from '../internal/StrictMock.ts';
import { Menu } from './Menu.ts';

export class MenuItem {
  private constructor() {
    MenuItem.__constructor(this);
    return strictMock(this);
  }

  public static __create(): MenuItem {
    return Reflect.construct(MenuItem, []) as MenuItem;
  }

  public static __constructor(_instance: MenuItem): void {
    // Spy hook.
  }

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
    return Menu.__create();
  }

  public setTitle(_title: DocumentFragment | string): this {
    return this;
  }

  public setWarning(_isWarning: boolean): this {
    return this;
  }
}
