import type { DropdownComponent as DropdownComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

export class DropdownComponent extends ValueComponent<string> {
  public selectEl: HTMLSelectElement;

  private changeCallback?: () => void;

  public constructor(containerEl: HTMLElement) {
    super();
    this.selectEl = containerEl.createEl('select');
    const self = strictProxyForce(this);
    self.constructor3__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): DropdownComponent {
    return new DropdownComponent(containerEl);
  }

  public static fromOriginalType3__(value: DropdownComponentOriginal): DropdownComponent {
    return mergePrototype(DropdownComponent, value);
  }

  public addOption(value: string, display: string): this {
    const option = createEl('option');
    option.value = value;
    option.text = display;
    this.selectEl.appendChild(option);
    return this;
  }

  public addOptions(options: Record<string, string>): this {
    for (const [value, display] of Object.entries(options)) {
      this.addOption(value, display);
    }
    return this;
  }

  public asOriginalType3__(): DropdownComponentOriginal {
    return strictProxyForce<DropdownComponentOriginal>(this);
  }

  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  public override getValue(): string {
    return this.selectEl.value;
  }

  public onChange(cb: (value: string) => void): this {
    this.changeCallback = (): void => {
      cb(this.getValue());
    };
    return this;
  }

  public override setValue(value: string): this {
    this.selectEl.value = value;
    this.changeCallback?.();
    return this;
  }

  /** Test helper to trigger change callback. */
  public simulateChange__(): void {
    this.changeCallback?.();
  }
}
