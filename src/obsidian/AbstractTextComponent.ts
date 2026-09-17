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
 * As in Obsidian, the value lives in the element: {@link AbstractTextComponent.getValue} reads `inputEl.value`, and
 * an `input` event on the element calls {@link AbstractTextComponent.onChanged}.
 *
 * @typeParam T - The wrapped element's type.
 */
export abstract class AbstractTextComponent<T extends HTMLInputElement | HTMLTextAreaElement> extends ValueComponent<string> {
  /**
   * The callback registered with {@link AbstractTextComponent.onChange}, if any.
   */
  public changeCallback?: (value: string) => unknown;

  /**
   * The wrapped `<input>` or `<textarea>` element.
   */
  public inputEl: T;

  /**
   * Wraps an input element, listening for its `input` events and turning spellcheck off, as Obsidian does.
   *
   * @param inputEl - The `<input>` or `<textarea>` to wrap.
   */
  public constructor(inputEl: T) {
    super();
    this.inputEl = inputEl;
    const self = strictProxy(this);
    inputEl.addEventListener('input', () => {
      self.onChanged();
    });
    inputEl.setAttribute('spellcheck', 'false');
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
    return strictProxy<AbstractTextComponent<T>>(value, AbstractTextComponent);
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
   * @returns The element's current value, including edits made directly to the element.
   */
  public override getValue(): string {
    return this.inputEl.value;
  }

  /**
   * Registers the callback to call when the user edits the value, replacing any earlier one.
   *
   * @param callback - Called with the new value.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: string) => unknown): this {
    this.changeCallback = callback;
    return this;
  }

  /**
   * Calls the change callback with the element's current value. The element's `input` listener calls it.
   */
  public onChanged(): void {
    this.changeCallback?.(this.inputEl.value);
  }

  /**
   * Enables or disables the component, writing the flag to the wrapped element as Obsidian does.
   *
   * @param disabled - Whether the component is disabled.
   * @returns This component, for chaining.
   */
  public override setDisabled(disabled: boolean): this {
    super.setDisabled(disabled);
    this.inputEl.disabled = disabled;
    return this;
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
   * Writes the value into the element. As in Obsidian, the change callback is not called, and a value that is not a
   * string is ignored.
   *
   * @param value - The new value.
   * @returns This component, for chaining.
   */
  public override setValue(value: string): this {
    // Obsidian ignores a value that is not a string, which an untyped caller can still pass.
    if (typeof (value as unknown) === 'string') {
      this.inputEl.value = value;
    }
    return this;
  }
}
