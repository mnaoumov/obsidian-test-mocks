import type { BaseComponent as BaseComponentOriginal } from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export abstract class BaseComponent {
  public disabled = false;

  protected constructor() {
    const self = createMockOf(this);
    self.constructor__();
    return self;
  }

  public static fromOriginalType__(value: BaseComponentOriginal): BaseComponent {
    return createMockOfUnsafe<BaseComponent>(value);
  }

  public asOriginalType__(): BaseComponentOriginal {
    return createMockOfUnsafe<BaseComponentOriginal>(this);
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
