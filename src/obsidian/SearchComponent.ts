import type { ValueComponent } from './ValueComponent.ts';

import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
  public clearButtonEl: HTMLElement;

  public constructor(_containerEl: HTMLElement) {
    super(createEl('input'));
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Accessing mock-only @deprecated inputEl.
    this.inputEl.type = 'search';
    this.clearButtonEl = createDiv();
    SearchComponent.__constructor(this, _containerEl);
  }

  public static override __constructor<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override onChanged(): void {
  }
}
