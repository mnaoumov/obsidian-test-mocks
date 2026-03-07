import type { ValueComponent } from './ValueComponent.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { TextComponent } from './TextComponent.ts';

export class MomentFormatComponent extends TextComponent {
  public defaultFormat = '';
  public sampleEl: HTMLElement = createDiv();

  public constructor(containerEl: HTMLElement) {
    super(containerEl);
    MomentFormatComponent.__constructor(this, containerEl);
    return strictMock(this);
  }

  public static override __constructor<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
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
