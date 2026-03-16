import type {
  ToggleComponent as ToggleComponentOriginal,
  TooltipOptions as TooltipOptionsOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ToggleComponent extends ValueComponent<boolean> {
  public toggleEl: HTMLElement;

  private _onChange: ((value: boolean) => unknown) | null = null;
  private value = false;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.toggleEl = createDiv();
    const self = strictProxyForce(this);
    self.constructor3__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): ToggleComponent {
    return new ToggleComponent(containerEl);
  }

  public static fromOriginalType3__(value: ToggleComponentOriginal): ToggleComponent {
    return mergePrototype(ToggleComponent, value);
  }

  public asOriginalType3__(): ToggleComponentOriginal {
    return strictProxyForce<ToggleComponentOriginal>(this);
  }

  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  public override getValue(): boolean {
    return this.value;
  }

  public onChange(callback: (value: boolean) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public onClick(): void {
    this.value = !this.value;
    this._onChange?.(this.value);
  }

  public setTooltip(tooltip: string, _options?: TooltipOptionsOriginal): this {
    this.toggleEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public override setValue(value: boolean): this {
    this.value = value;
    this._onChange?.(value);
    return this;
  }
}
