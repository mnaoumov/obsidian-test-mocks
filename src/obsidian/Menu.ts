import type {
  MenuPositionDef,
  MenuItem as ObsidianMenuItem
} from 'obsidian';

import { noop } from '../internal/Noop.ts';
import { castTo } from '../internal/Cast.ts';
import { Component } from './Component.ts';
import { MenuItem } from './MenuItem.ts';

export class Menu extends Component {
  public dom: HTMLElement = createDiv();

  public addItem(cb: (item: ObsidianMenuItem) => unknown): this {
    cb(castTo<ObsidianMenuItem>(new MenuItem()));
    return this;
  }

  public addSeparator(): this {
    return this;
  }

  public close(): void {
    noop();
  }

  public hide(): this {
    return this;
  }

  public onHide(_callback: () => unknown): void {
    noop();
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

  public showAtPosition(_position: MenuPositionDef, _doc?: Document): this {
    return this;
  }

  public static forEvent(_evt: MouseEvent | PointerEvent): Menu {
    return new Menu();
  }
}
