import type { TextAreaComponent as TextAreaComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
  private static insideCreate__ = false;
  public constructor(_containerEl: HTMLElement) {
    super(createEl('textarea'));
    if (new.target === TextAreaComponent && !TextAreaComponent.insideCreate__) {
      return TextAreaComponent.create__(_containerEl);
    }
  }

  public static create__(containerEl: HTMLElement): TextAreaComponent {
    TextAreaComponent.insideCreate__ = true;
    const instance = strictMock(new TextAreaComponent(containerEl));
    TextAreaComponent.insideCreate__ = false;
    return instance;
  }

  public override asOriginalType__(): TextAreaComponentOriginal {
    return castTo<TextAreaComponentOriginal>(this);
  }
}
