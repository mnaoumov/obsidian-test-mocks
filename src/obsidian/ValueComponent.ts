import type { ValueComponent as ValueComponentOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { BaseComponent } from './BaseComponent.ts';

export abstract class ValueComponent<T> extends BaseComponent {
  /** @deprecated Mock-only abstract getter. inputEl is a concrete property in the Obsidian API. */
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- Declaring mock-only abstract getter.
  public abstract get inputEl(): HTMLElement;

  protected constructor() {
    super();
    ValueComponent.constructor__(this);
  }

  public static override constructor__<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
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
