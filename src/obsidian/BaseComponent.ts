/**
 * @file
 *
 * Mock of Obsidian's `BaseComponent`, the root of the setting UI components.
 */

import type { BaseComponent as BaseComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `BaseComponent`, the base of every setting control such as buttons, toggles and text
 * fields. The mock tracks the disabled state without touching any element.
 */
export abstract class BaseComponent {
  /**
   * Whether the component is disabled.
   */
  public disabled = false;

  /**
   * Creates an enabled component.
   */
  protected constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `BaseComponent` as this mock.
   *
   * @param value - The value typed as the original `BaseComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: BaseComponentOriginal): BaseComponent {
    return strictProxy(value, BaseComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `BaseComponent` type.
   *
   * @returns The same object, typed as the original `BaseComponent`.
   */
  public asOriginalType__(): BaseComponentOriginal {
    return strictProxy<BaseComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(BaseComponent.prototype, 'constructor__')`.
   */
  public constructor__(): void {
    noop();
  }

  /**
   * Enables or disables the component. The mock only records the flag in {@link BaseComponent.disabled}.
   *
   * @param disabled - `true` to disable the component.
   * @returns This component, for chaining.
   */
  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }

  /**
   * Calls a function with the component, to configure it inside a builder chain.
   *
   * @param callback - Called synchronously with this component.
   * @returns This component, for chaining.
   */
  public then(callback: (component: this) => unknown): this {
    callback(this);
    return this;
  }
}
