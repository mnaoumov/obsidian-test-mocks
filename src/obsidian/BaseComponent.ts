import type { BaseComponent as BaseComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export abstract class BaseComponent {
  public disabled = false;

  protected constructor() {
    const self = strictMock(this);
    self.constructor__();
    return self;
  }

  public asOriginalType__(): BaseComponentOriginal {
    return castTo<BaseComponentOriginal>(this);
  }

  public constructor__(): void {
    noop();
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
