import type { ValueComponent as ValueComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { BaseComponent } from './BaseComponent.ts';

export abstract class ValueComponent<T> extends BaseComponent {
  protected constructor() {
    super();
    const self = strictMock(this);
    self.constructor2__();
    return self;
  }

  public override asOriginalType__(): ValueComponentOriginal<T> {
    return castTo<ValueComponentOriginal<T>>(this);
  }

  public constructor2__(): void {
    noop();
  }

  public abstract getValue(): T;

  public registerOptionListener(_listeners: Record<string, (value?: T) => T>, _key: string): this {
    return this;
  }

  public abstract setValue(value: T): this;
}
