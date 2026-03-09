import type { TextAreaComponent as TextAreaComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
  public constructor(_containerEl: HTMLElement) {
    super(createEl('textarea'));
    return strictMock(this);
  }

  public override asOriginalType__(): TextAreaComponentOriginal {
    return castTo<TextAreaComponentOriginal>(this);
  }
}
