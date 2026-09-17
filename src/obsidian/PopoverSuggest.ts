/**
 * @file
 *
 * Mock of Obsidian's `PopoverSuggest`, the base class for type-ahead suggestion popovers.
 */

import type { PopoverSuggest as PopoverSuggestOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Scope } from './Scope.ts';

/**
 * Mock of Obsidian's `PopoverSuggest`, the base class for adding a type-ahead popover.
 *
 * No popover is rendered: opening and closing only toggle {@link PopoverSuggest.isOpen}.
 *
 * @typeParam T - The type of a suggestion item.
 */
export abstract class PopoverSuggest<T> {
  /**
   * The app instance.
   */
  public app: App;

  /**
   * Whether the popover is currently open.
   */
  public isOpen = false;

  /**
   * The keymap scope active while the popover is open.
   */
  public scope: Scope;

  /**
   * Creates the suggestion popover.
   *
   * @param app - The app instance.
   * @param scope - The keymap scope to use; a new scope is created when omitted.
   */
  public constructor(app: App, scope?: Scope) {
    this.app = app;
    this.scope = scope ?? Scope.create__();
    const self = strictProxy(this);
    self.constructor__(app, scope);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `PopoverSuggest` as this mock.
   *
   * @typeParam T - The type of a suggestion item.
   * @param value - The value typed as the original `PopoverSuggest`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__<T>(value: PopoverSuggestOriginal<T>): PopoverSuggest<T> {
    return strictProxy<PopoverSuggest<T>>(value, PopoverSuggest);
  }

  /**
   * Mock-only: views this mock as Obsidian's `PopoverSuggest` type.
   *
   * @returns The same object, typed as the original `PopoverSuggest`.
   */
  public asOriginalType__(): PopoverSuggestOriginal<T> {
    return strictProxy<PopoverSuggestOriginal<T>>(this);
  }

  /**
   * Closes the popover. The mock only clears {@link PopoverSuggest.isOpen}.
   */
  public close(): void {
    this.isOpen = false;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(PopoverSuggest.prototype, 'constructor__')`.
   *
   * @param _app - The app the popover was created with.
   * @param _scope - The scope the popover was created with, if any.
   */
  public constructor__(_app: App, _scope?: Scope): void {
    noop();
  }

  /**
   * Opens the popover. The mock only sets {@link PopoverSuggest.isOpen}.
   */
  public open(): void {
    this.isOpen = true;
  }

  /**
   * Renders one suggestion into its list item element.
   *
   * @param value - The suggestion to render.
   * @param el - The element to render it into.
   */
  public abstract renderSuggestion(value: T, el: HTMLElement): void;

  /**
   * Called when the user picks a suggestion, by click or keyboard.
   *
   * @param value - The chosen suggestion.
   * @param event - The event that picked it.
   */
  public abstract selectSuggestion(value: T, event: KeyboardEvent | MouseEvent): void;
}
