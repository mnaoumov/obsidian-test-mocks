import type { TextAreaComponent as TextAreaComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
  public constructor(_containerEl: HTMLElement) {
    super(createEl('textarea'));
    this.constructor__(_containerEl);
  }

  public static create__(containerEl: HTMLElement): TextAreaComponent {
    return strictMock(new TextAreaComponent(containerEl));
  }

  public override asOriginalType__(): TextAreaComponentOriginal {
    return castTo<TextAreaComponentOriginal>(this);
  }

  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }
}
