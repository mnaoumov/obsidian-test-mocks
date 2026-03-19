import type { SearchComponent as SearchComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
  public clearButtonEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super(containerEl.createEl('input'));
    this.inputEl.type = 'search';
    this.clearButtonEl = containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor4__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): SearchComponent {
    return new SearchComponent(containerEl);
  }

  public static fromOriginalType4__(value: SearchComponentOriginal): SearchComponent {
    return strictProxy(value, SearchComponent);
  }

  public asOriginalType4__(): SearchComponentOriginal {
    return strictProxy<SearchComponentOriginal>(this);
  }

  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }

  public override onChanged(): void {
    noop();
  }
}
