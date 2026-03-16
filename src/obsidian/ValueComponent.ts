import type { ValueComponent as ValueComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { BaseComponent } from './BaseComponent.ts';

export abstract class ValueComponent<T> extends BaseComponent {
  protected constructor() {
    super();
    const self = strictProxyForce(this);
    self.constructor2__();
    return self;
  }

  public static fromOriginalType2__<T>(value: ValueComponentOriginal<T>): ValueComponent<T> {
    return strictProxyForce<ValueComponent<T>>(value);
  }

  public asOriginalType2__(): ValueComponentOriginal<T> {
    return strictProxyForce<ValueComponentOriginal<T>>(this);
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
