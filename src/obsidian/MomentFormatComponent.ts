import type { MomentFormatComponent as MomentFormatComponentOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { TextComponent } from './TextComponent.ts';

export class MomentFormatComponent extends TextComponent {
  public defaultFormat = '';
  public sampleEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super(containerEl);
    this.sampleEl = createDiv();
    const self = createMockOfUnsafe(this);
    self.constructor5__(containerEl);
    return self;
  }

  public static create2__(containerEl: HTMLElement): MomentFormatComponent {
    return new MomentFormatComponent(containerEl);
  }

  public static fromOriginalType5__(value: MomentFormatComponentOriginal): MomentFormatComponent {
    return createMockOfUnsafe<MomentFormatComponent>(value);
  }

  public asOriginalType5__(): MomentFormatComponentOriginal {
    return createMockOfUnsafe<MomentFormatComponentOriginal>(this);
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
