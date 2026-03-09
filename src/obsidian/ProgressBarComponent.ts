import type { ProgressBarComponent as ProgressBarComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ProgressBarComponent extends ValueComponent<number> {
  public progressBar__: HTMLElement;

  private _value = 0;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.progressBar__ = createDiv();
  }

  public static create__(containerEl: HTMLElement): ProgressBarComponent {
    return strictMock(new ProgressBarComponent(containerEl));
  }

  public override asOriginalType__(): ProgressBarComponentOriginal {
    return castTo<ProgressBarComponentOriginal>(this);
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
