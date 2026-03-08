import type { TextAreaComponent as RealTextAreaComponent } from 'obsidian';

import type { ValueComponent } from './ValueComponent.ts';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
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

  public override asReal__(): RealTextAreaComponent {
    return strictCastTo<RealTextAreaComponent>(this);
  }
}
