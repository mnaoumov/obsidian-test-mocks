/**
 * @file
 *
 * Mock of Obsidian's `AbstractInputSuggest`, the type-ahead popover attached to a text input.
 */

import type { AbstractInputSuggest as AbstractInputSuggestOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

const DEFAULT_LIMIT = 100;

/**
 * Mock of Obsidian's `AbstractInputSuggest`, which adds type-ahead suggestions to an `<input>` or a
 * `<div>` with `contentEditable` set.
 *
 * The mock reads and writes the element's value, and records the selection callback in
 * {@link AbstractInputSuggest.onSelectCallback__} without ever calling it; no popover is shown.
 *
 * @typeParam T - The type of a suggestion.
 */
export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  /**
   * The maximum number of suggestions rendered at once; `0` disables the limit. Defaults to `100`.
   */
  public limit = DEFAULT_LIMIT;
  /**
   * Mock-only: the callback last registered through {@link AbstractInputSuggest.onSelect}, which a test can call to
   * simulate the user picking a suggestion.
   */
  public onSelectCallback__?: (value: T, event: KeyboardEvent | MouseEvent) => unknown;
  /**
   * The text input element this suggest is attached to.
   */
  public readonly textInputEl: HTMLDivElement | HTMLInputElement;
  /**
   * Attaches the suggest to a text input.
   *
   * @param app - The app instance.
   * @param textInputEl - An `<input>` text box or a `<div>` with `contentEditable` set.
   */
  public constructor(app: App, textInputEl: HTMLDivElement | HTMLInputElement) {
    super(app);
    this.textInputEl = textInputEl;
    const self = strictProxy(this);
    self.constructor2__(app, textInputEl);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `AbstractInputSuggest` as this mock.
   *
   * @typeParam T - The type of a suggestion.
   * @param value - The value typed as the original `AbstractInputSuggest`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__<T>(value: AbstractInputSuggestOriginal<T>): AbstractInputSuggest<T> {
    return strictProxy<AbstractInputSuggest<T>>(value);
  }

  /**
   * Mock-only: views this mock as Obsidian's `AbstractInputSuggest` type.
   *
   * @returns The same object, typed as the original `AbstractInputSuggest`.
   */
  public asOriginalType2__(): AbstractInputSuggestOriginal<T> {
    return strictProxy<AbstractInputSuggestOriginal<T>>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(AbstractInputSuggest.prototype, 'constructor2__')`.
   *
   * @param _app - The app the suggest was created with.
   * @param _textInputEl - The text input element the suggest was attached to.
   */
  public constructor2__(_app: App, _textInputEl: HTMLDivElement | HTMLInputElement): void {
    noop();
  }

  /**
   * Gets the value from the input element.
   *
   * @returns The `<input>`'s value, or the `<div>`'s text content.
   */
  public getValue(): string {
    return this.textInputEl instanceof HTMLInputElement ? this.textInputEl.value : this.textInputEl.textContent;
  }

  /**
   * Registers a callback to handle the user selecting a suggestion. The mock stores it in
   * {@link AbstractInputSuggest.onSelectCallback__}, replacing any earlier one, and never calls it itself.
   *
   * @param callback - Called with the selected suggestion and the event that selected it.
   * @returns This suggest, for chaining.
   */
  public onSelect(callback: (value: T, event: KeyboardEvent | MouseEvent) => unknown): this {
    this.onSelectCallback__ = callback;
    return this;
  }

  /**
   * Sets the value into the input element. No `input` event is dispatched.
   *
   * @param value - The new value: the `<input>`'s value, or the `<div>`'s text content.
   */
  public setValue(value: string): void {
    if (this.textInputEl instanceof HTMLInputElement) {
      this.textInputEl.value = value;
    } else {
      this.textInputEl.textContent = value;
    }
  }
}
