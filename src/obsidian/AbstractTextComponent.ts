/**
 * @file
 *
 * Mock of Obsidian's `AbstractTextComponent`, the shared base of the text and text area components.
 */

import type { AbstractTextComponent as AbstractTextComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

/**
 * Mock of Obsidian's `AbstractTextComponent`, a value component wrapping a text `<input>` or `<textarea>`.
 *
 * The mock keeps the value in memory and mirrors it into the element on {@link AbstractTextComponent.setValue};
 * edits made directly to the element are not read back.
 *
 * @typeParam T - The wrapped element's type.
 */
export abstract class AbstractTextComponent<T extends HTMLInputElement | HTMLTextAreaElement> extends ValueComponent<string> {
  /**
   * The wrapped `<input>` or `<textarea>` element.
   */
  public inputEl: T;

  private _onChange?: (value: string) => unknown;
  private value = '';

  /**
   * Wraps an input element.
   *
   * @param inputEl - The `<input>` or `<textarea>` to wrap.
   */
  public constructor(inputEl: T) {
    super();
    this.inputEl = inputEl;
    const self = strictProxy(this);
    self.constructor3__(inputEl);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `AbstractTextComponent` as this mock.
   *
   * @typeParam T - The wrapped element's type.
   * @param value - The value typed as the original `AbstractTextComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__<T extends HTMLInputElement | HTMLTextAreaElement>(value: AbstractTextComponentOriginal<T>): AbstractTextComponent<T> {
    return strictProxy<AbstractTextComponent<T>>(value);
  }

  /**
   * Mock-only: views this mock as Obsidian's `AbstractTextComponent` type.
   *
   * @returns The same object, typed as the original `AbstractTextComponent`.
   */
  public asOriginalType3__(): AbstractTextComponentOriginal<T> {
    return strictProxy<AbstractTextComponentOriginal<T>>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(AbstractTextComponent.prototype, 'constructor3__')`.
   *
   * @param _inputEl - The element the component was created with.
   */
  public constructor3__(_inputEl: T): void {
    noop();
  }

  /**
   * Gets the component's value.
   *
   * @returns The value last set through {@link AbstractTextComponent.setValue}, or an empty string.
   */
  public override getValue(): string {
    return this.value;
  }

  /**
   * Registers the callback to call when the value changes, replacing any earlier one.
   *
   * @param callback - Called with the new value.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: string) => unknown): this {
    this._onChange = callback;
    return this;
  }

  /**
   * Notifies the change callback of the current value, as Obsidian does when the user edits the element.
   */
  public onChanged(): void {
    this._onChange?.(this.value);
  }

  /**
   * Sets the element's placeholder text.
   *
   * @param placeholder - The placeholder to show while the element is empty.
   * @returns This component, for chaining.
   */
  public setPlaceholder(placeholder: string): this {
    this.inputEl.placeholder = placeholder;
    return this;
  }

  /**
   * Sets the component's value and writes it into the element. Unlike Obsidian, the mock also calls the change
   * callback.
   *
   * @param value - The new value.
   * @returns This component, for chaining.
   */
  public override setValue(value: string): this {
    this.value = value;
    this.inputEl.value = value;
    this._onChange?.(value);
    return this;
  }
}
