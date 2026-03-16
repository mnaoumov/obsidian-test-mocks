import type { SearchComponent as SearchComponentOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
  public clearButtonEl: HTMLElement;

  public constructor(_containerEl: HTMLElement) {
    super(createEl('input'));
    this.inputEl.type = 'search';
    this.clearButtonEl = createDiv();
    const self = createMockOfUnsafe(this);
    self.constructor4__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): SearchComponent {
    return new SearchComponent(containerEl);
  }

  public static fromOriginalType4__(value: SearchComponentOriginal): SearchComponent {
    return createMockOfUnsafe<SearchComponent>(value);
  }

  public asOriginalType4__(): SearchComponentOriginal {
    return createMockOfUnsafe<SearchComponentOriginal>(this);
  }

  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }

  public override onChanged(): void {
    noop();
  }
}
