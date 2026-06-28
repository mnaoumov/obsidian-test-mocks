import type { DisplayValueComponent as DisplayValueComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class DisplayValueComponent {
  public valueEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    this.valueEl = containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): DisplayValueComponent {
    return new DisplayValueComponent(containerEl);
  }

  public static fromOriginalType__(value: DisplayValueComponentOriginal): DisplayValueComponent {
    return strictProxy(value, DisplayValueComponent);
  }

  public asOriginalType__(): DisplayValueComponentOriginal {
    return strictProxy<DisplayValueComponentOriginal>(this);
  }

  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }

  public setStatus(status: 'warning' | null): this {
    this.valueEl.toggleClass('mod-warning', status === 'warning');
    return this;
  }

  public setValue(value: null | string): this {
    this.valueEl.textContent = value ?? '';
    return this;
  }
}
