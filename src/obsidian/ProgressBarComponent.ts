import type { ProgressBarComponent as ProgressBarComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ProgressBarComponent extends ValueComponent<number> {
  public progressBar__: HTMLElement;

  private value = 0;

  public constructor(containerEl: HTMLElement) {
    super();
    this.progressBar__ = containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor3__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): ProgressBarComponent {
    return new ProgressBarComponent(containerEl);
  }

  public static fromOriginalType3__(value: ProgressBarComponentOriginal): ProgressBarComponent {
    return strictProxy(value, ProgressBarComponent);
  }

  public asOriginalType3__(): ProgressBarComponentOriginal {
    return strictProxy<ProgressBarComponentOriginal>(this);
  }

  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  public override getValue(): number {
    return this.value;
  }

  public override setValue(value: number): this {
    this.value = value;
    this.progressBar__.style.width = `${String(value)}%`;
    this.progressBar__.dataset['value'] = String(value);
    return this;
  }
}
