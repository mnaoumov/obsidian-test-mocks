/**
 * @file
 *
 * Mock of Obsidian's `SearchComponent`, a search input with a clear button.
 */

import type { SearchComponent as SearchComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

/**
 * Mock of Obsidian's `SearchComponent`, a `type="search"` input with a button that clears it.
 */
export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
  /**
   * The button element that clears the input.
   */
  public clearButtonEl: HTMLElement;

  /**
   * Creates the search input and its clear button inside `containerEl`.
   *
   * @param containerEl - The element to create the component in.
   */
  public constructor(containerEl: HTMLElement) {
    super(containerEl.createEl('input'));
    this.inputEl.type = 'search';
    this.clearButtonEl = containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor4__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a search component, spyable via `vi.spyOn(SearchComponent, 'create__')`.
   *
   * @param containerEl - The element to create the component in.
   * @returns The new search component.
   */
  public static create__(containerEl: HTMLElement): SearchComponent {
    return new SearchComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `SearchComponent` as this mock.
   *
   * @param value - The value typed as the original `SearchComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: SearchComponentOriginal): SearchComponent {
    return strictProxy(value, SearchComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `SearchComponent` type.
   *
   * @returns The same object, typed as the original `SearchComponent`.
   */
  public asOriginalType4__(): SearchComponentOriginal {
    return strictProxy<SearchComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(SearchComponent.prototype, 'constructor4__')`.
   *
   * @param _containerEl - The element the component was created in.
   */
  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Called when the input's value changes; Obsidian uses it to show or hide the clear button. A no-op in the mock.
   */
  public override onChanged(): void {
    noop();
  }
}
