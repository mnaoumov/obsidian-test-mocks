/**
 * @file
 *
 * Mock of Obsidian's `ValueComponent`, the base of UI components that hold a value.
 */

import type { ValueComponent as ValueComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { BaseComponent } from './BaseComponent.ts';

/**
 * Mock of Obsidian's `ValueComponent` base class.
 *
 * @typeParam T - The type of the component's value.
 */
export abstract class ValueComponent<T> extends BaseComponent {
  /**
   * Creates the component.
   */
  protected constructor() {
    super();
    const self = strictProxy(this);
    self.constructor2__();
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ValueComponent` as this mock.
   *
   * @typeParam T - The type of the component's value.
   * @param value - The value typed as the original `ValueComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__<T>(value: ValueComponentOriginal<T>): ValueComponent<T> {
    return strictProxy<ValueComponent<T>>(value, ValueComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ValueComponent` type.
   *
   * @returns The same object, typed as the original `ValueComponent`.
   */
  public asOriginalType2__(): ValueComponentOriginal<T> {
    return strictProxy<ValueComponentOriginal<T>>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ValueComponent.prototype, 'constructor2__')`.
   */
  public constructor2__(): void {
    noop();
  }

  /**
   * Gets the component's current value.
   *
   * @returns The current value.
   */
  public abstract getValue(): T;

  /**
   * Registers a listener under `key` that sets the component's value when called with one and returns the current
   * value. A no-op in the mock, which registers nothing.
   *
   * @param _listeners - The record of option listeners.
   * @param _key - The key of the listener to bind.
   * @returns This component, for chaining.
   */
  public registerOptionListener(_listeners: Record<string, (value?: T) => T>, _key: string): this {
    return this;
  }

  /**
   * Sets the component's value.
   *
   * @param value - The new value.
   * @returns This component, for chaining.
   */
  public abstract setValue(value: T): this;
}
