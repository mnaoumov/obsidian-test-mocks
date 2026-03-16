import type { TextAreaComponent as TextAreaComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
  public constructor(_containerEl: HTMLElement) {
    super(createEl('textarea'));
    const self = strictProxyForce(this);
    self.constructor4__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): TextAreaComponent {
    return new TextAreaComponent(containerEl);
  }

  public static fromOriginalType4__(value: TextAreaComponentOriginal): TextAreaComponent {
    return mergePrototype(TextAreaComponent, value);
  }

  public asOriginalType4__(): TextAreaComponentOriginal {
    return strictProxyForce<TextAreaComponentOriginal>(this);
  }

  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }
}
