import type { MomentFormatComponent as MomentFormatComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { TextComponent } from './TextComponent.ts';

export class MomentFormatComponent extends TextComponent {
  public defaultFormat = '';
  public sampleEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super(containerEl);
    this.sampleEl = createDiv();
    const self = strictMock(this);
    self.constructor5__(containerEl);
    return self;
  }

  public static create2__(containerEl: HTMLElement): MomentFormatComponent {
    return new MomentFormatComponent(containerEl);
  }

  public static fromOriginalType4__(value: MomentFormatComponentOriginal): MomentFormatComponent {
    return castTo<MomentFormatComponent>(value);
  }

  public override asOriginalType__(): MomentFormatComponentOriginal {
    return castTo<MomentFormatComponentOriginal>(this);
  }

  public constructor5__(_containerEl: HTMLElement): void {
    noop();
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
