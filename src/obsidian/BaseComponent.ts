import type { BaseComponent as BaseComponentOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';

export abstract class BaseComponent {
  public disabled = false;

  protected constructor() {
    noop();
  }

  public asOriginalType__(): BaseComponentOriginal {
    return castTo<BaseComponentOriginal>(this);
  }

  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }

  public then(cb: (component: this) => unknown): this {
    cb(this);
    return this;
  }
}
