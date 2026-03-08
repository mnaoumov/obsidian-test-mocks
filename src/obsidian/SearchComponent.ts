import { castTo } from '../internal/Cast.ts';
import type { SearchComponent as RealSearchComponent } from 'obsidian';

import type { ValueComponent } from './ValueComponent.ts';

import {
  strictMock
} from '../internal/StrictMock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
  public clearButtonEl: HTMLElement;

  public constructor(_containerEl: HTMLElement) {
    super(createEl('input'));
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Accessing mock-only @deprecated inputEl.
    this.inputEl.type = 'search';
    this.clearButtonEl = createDiv();
    const mock = strictMock(this);
    SearchComponent.constructor__(mock, _containerEl);
    return mock;
  }

  public static override constructor__<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override onChanged(): void {
  }

  public override asReal__(): RealSearchComponent {
    return castTo<RealSearchComponent>(this);
  }
}
