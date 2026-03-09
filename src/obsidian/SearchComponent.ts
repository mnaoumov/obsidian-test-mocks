import type { SearchComponent as SearchComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
  public clearButtonEl: HTMLElement;

  public constructor(_containerEl: HTMLElement) {
    super(createEl('input'));
    this.inputEl.type = 'search';
    this.clearButtonEl = createDiv();
  }

  public static create__(containerEl: HTMLElement): SearchComponent {
    return strictMock(new SearchComponent(containerEl));
  }

  public override asOriginalType__(): SearchComponentOriginal {
    return castTo<SearchComponentOriginal>(this);
  }

  public override onChanged(): void {
    noop();
  }
}
