import type { SearchComponent as SearchComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
  private static insideCreate__ = false;
  public clearButtonEl: HTMLElement;

  public constructor(_containerEl: HTMLElement) {
    super(createEl('input'));
    this.inputEl.type = 'search';
    this.clearButtonEl = createDiv();
    if (new.target === SearchComponent && !SearchComponent.insideCreate__) {
      return SearchComponent.create__(_containerEl);
    }
  }

  public static create__(containerEl: HTMLElement): SearchComponent {
    SearchComponent.insideCreate__ = true;
    const instance = strictMock(new SearchComponent(containerEl));
    SearchComponent.insideCreate__ = false;
    return instance;
  }

  public override asOriginalType__(): SearchComponentOriginal {
    return castTo<SearchComponentOriginal>(this);
  }

  public override onChanged(): void {
    noop();
  }
}
