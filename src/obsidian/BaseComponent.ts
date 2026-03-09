import type { BaseComponent as BaseComponentOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';

export abstract class BaseComponent {
  public disabled = false;

  protected constructor() {
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
