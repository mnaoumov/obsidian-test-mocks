import type { BaseComponent as BaseComponentOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export abstract class BaseComponent {
  public disabled = false;

  protected constructor() {
    const mock = strictMock(this);
    BaseComponent.constructor__(mock);
    return mock;
  }

  public static constructor__(_instance: BaseComponent, ..._args: unknown[]): void {
    // Spy hook.
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
