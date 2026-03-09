import type { MomentFormatComponent as MomentFormatComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { TextComponent } from './TextComponent.ts';

export class MomentFormatComponent extends TextComponent {
  public defaultFormat = '';
  public sampleEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super(containerEl);
    this.sampleEl = createDiv();
    return strictMock(this);
  }

  public override asOriginalType__(): MomentFormatComponentOriginal {
    return castTo<MomentFormatComponentOriginal>(this);
  }

  public setDefaultFormat(defaultFormat: string): this {
    this.defaultFormat = defaultFormat;
    return this;
  }

  public setSampleEl(sampleEl: HTMLElement): this {
    this.sampleEl = sampleEl;
    return this;
  }

  public override setValue(value: string): this {
    return super.setValue(value);
  }
}
