import type { TextAreaComponent as TextAreaComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
  public constructor(containerEl: HTMLElement) {
    super(containerEl.createEl('textarea'));
    const self = strictProxy(this);
    self.constructor4__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): TextAreaComponent {
    return new TextAreaComponent(containerEl);
  }

  public static fromOriginalType4__(value: TextAreaComponentOriginal): TextAreaComponent {
    return strictProxy(value, TextAreaComponent);
  }

  public asOriginalType4__(): TextAreaComponentOriginal {
    return strictProxy<TextAreaComponentOriginal>(this);
  }

  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }
}
