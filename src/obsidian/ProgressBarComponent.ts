import type { ProgressBarComponent as ProgressBarComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ProgressBarComponent extends ValueComponent<number> {
  public progressBar: HTMLElement;

  public override get inputEl(): HTMLElement {
    return this.progressBar;
  }

  private _value = 0;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.progressBar = createDiv();
    return strictMock(this);
  }

  public override asOriginalType__(): ProgressBarComponentOriginal {
    return castTo<ProgressBarComponentOriginal>(this);
  }

  public override getValue(): number {
    return this._value;
  }

  public override setValue(value: number): this {
    this._value = value;
    this.progressBar.style.width = `${String(value)}%`;
    this.progressBar.dataset['value'] = String(value);
    return this;
  }
}
