/**
 * @file
 *
 * Mock of Obsidian's `FuzzySuggestModal`, the suggestion modal that fuzzy-matches items by their text.
 */

import type {
  FuzzyMatch as FuzzyMatchOriginal,
  FuzzySuggestModal as FuzzySuggestModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { SuggestModal } from './SuggestModal.ts';

/**
 * Mock of Obsidian's `FuzzySuggestModal`.
 *
 * Suggestions are `FuzzyMatch` wrappers around the items; choosing one unwraps it and forwards the item to
 * {@link FuzzySuggestModal.onChooseItem}.
 *
 * @typeParam T - The type of the items being suggested.
 */
export abstract class FuzzySuggestModal<T> extends SuggestModal<FuzzyMatchOriginal<T>> {
  /**
   * Creates a fuzzy suggestion modal.
   *
   * @param app - The app the modal belongs to.
   */
  public constructor(app: App) {
    super(app);
    const self = strictProxy(this);
    self.constructor3__(app);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `FuzzySuggestModal` as this mock.
   *
   * @typeParam T - The type of the items being suggested.
   * @param value - The value typed as the original `FuzzySuggestModal`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__<T>(value: FuzzySuggestModalOriginal<T>): FuzzySuggestModal<T> {
    return strictProxy<FuzzySuggestModal<T>>(value, FuzzySuggestModal);
  }

  /**
   * Mock-only: views this mock as Obsidian's `FuzzySuggestModal` type.
   *
   * @returns The same object, typed as the original `FuzzySuggestModal`.
   */
  public asOriginalType3__(): FuzzySuggestModalOriginal<T> {
    return strictProxy<FuzzySuggestModalOriginal<T>>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(FuzzySuggestModal.prototype, 'constructor3__')`.
   *
   * @param _app - The app the modal was created with.
   */
  public constructor3__(_app: App): void {
    noop();
  }

  /**
   * Gets every item the modal can suggest. Abstract in Obsidian; subclasses override it.
   *
   * @returns An empty list in the mock.
   */
  public getItems(): T[] {
    return [];
  }

  /**
   * Gets the text an item is fuzzy-matched and displayed by. Abstract in Obsidian; subclasses override it.
   *
   * @param _item - The item to describe.
   * @returns An empty string in the mock.
   */
  public getItemText(_item: T): string {
    return '';
  }

  /**
   * Called when the user chooses an item. Abstract in Obsidian; a no-op in the mock until a subclass overrides it.
   *
   * @param _item - The chosen item.
   * @param _event - The keyboard or mouse event that made the choice.
   */
  public onChooseItem(_item: T, _event: KeyboardEvent | MouseEvent): void {
    noop();
  }

  /**
   * Called when the user chooses a suggestion; unwraps the fuzzy match and forwards its item to
   * {@link FuzzySuggestModal.onChooseItem}.
   *
   * @param item - The chosen fuzzy match.
   * @param event - The keyboard or mouse event that made the choice.
   */
  public override onChooseSuggestion(item: FuzzyMatchOriginal<T>, event: KeyboardEvent | MouseEvent): void {
    this.onChooseItem(item.item, event);
  }
}
