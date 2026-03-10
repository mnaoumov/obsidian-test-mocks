import type { ProgressBarComponent as ProgressBarComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ProgressBarComponent extends ValueComponent<number> {
  public progressBar__: HTMLElement;

  private _value = 0;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.progressBar__ = createDiv();
    const self = strictMock(this);
    self.constructor3__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): ProgressBarComponent {
    return new ProgressBarComponent(containerEl);
  }

  public override asOriginalType__(): ProgressBarComponentOriginal {
    return castTo<ProgressBarComponentOriginal>(this);
  }

  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  public override getValue(): number {
    return this._value;
  }

  public override setValue(value: number): this {
    this._value = value;
    this.progressBar__.style.width = `${String(value)}%`;
    this.progressBar__.dataset['value'] = String(value);
    return this;
  }
}
