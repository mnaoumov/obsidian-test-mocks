import type { BaseComponent as BaseComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export abstract class BaseComponent {
  public disabled = false;

  protected constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  public static fromOriginalType__(value: BaseComponentOriginal): BaseComponent {
    return strictProxy(value, BaseComponent);
  }

  public asOriginalType__(): BaseComponentOriginal {
    return strictProxy<BaseComponentOriginal>(this);
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
