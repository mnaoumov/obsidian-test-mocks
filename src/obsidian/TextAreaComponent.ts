import type { TextAreaComponent as TextAreaComponentOriginal } from 'obsidian';

import type { ValueComponent } from './ValueComponent.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
  public constructor(_containerEl: HTMLElement) {
    super(createEl('textarea'));
    const mock = strictMock(this);
    TextAreaComponent.constructor__(mock, _containerEl);
    return mock;
  }

  public static override constructor__<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override asOriginalType__(): TextAreaComponentOriginal {
    return castTo<TextAreaComponentOriginal>(this);
  }
}
