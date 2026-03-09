import type { ValueComponent as ValueComponentOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { BaseComponent } from './BaseComponent.ts';

export abstract class ValueComponent<T> extends BaseComponent {
  public abstract get inputEl(): HTMLElement;

  protected constructor() {
    super();
  }

  public override asOriginalType__(): ValueComponentOriginal<T> {
    return castTo<ValueComponentOriginal<T>>(this);
  }

  public abstract getValue(): T;

  public registerOptionListener(_listeners: Record<string, (value?: T) => T>, _key: string): this {
    return this;
  }

  public abstract setValue(value: T): this;
}
