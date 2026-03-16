import type { SearchComponent as SearchComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
  public clearButtonEl: HTMLElement;

  public constructor(_containerEl: HTMLElement) {
    super(createEl('input'));
    this.inputEl.type = 'search';
    this.clearButtonEl = createDiv();
    const self = strictProxyForce(this);
    self.constructor4__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): SearchComponent {
    return new SearchComponent(containerEl);
  }

  public static fromOriginalType4__(value: SearchComponentOriginal): SearchComponent {
    return strictProxyForce(value, SearchComponent);
  }

  public asOriginalType4__(): SearchComponentOriginal {
    return strictProxyForce<SearchComponentOriginal>(this);
  }

  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }

  public override onChanged(): void {
    noop();
  }
}
