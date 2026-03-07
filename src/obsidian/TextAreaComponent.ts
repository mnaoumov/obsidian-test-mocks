import type { ValueComponent } from './ValueComponent.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
  public constructor(_containerEl: HTMLElement) {
    super(createEl('textarea'));
    const mock = strictMock(this);
    TextAreaComponent.__constructor(mock, _containerEl);
    return mock;
  }

  public static override __constructor<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
  }
}
