import type { MomentFormatComponent as MomentFormatComponentOriginal } from 'obsidian';

import type { ValueComponent } from './ValueComponent.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { TextComponent } from './TextComponent.ts';

export class MomentFormatComponent extends TextComponent {
  public defaultFormat = '';
  public sampleEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super(containerEl);
    this.sampleEl = createDiv();
    const mock = strictMock(this);
    MomentFormatComponent.constructor__(mock, containerEl);
    return mock;
  }

  public static override constructor__<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
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
