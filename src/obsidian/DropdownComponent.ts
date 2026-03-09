import type { DropdownComponent as DropdownComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class DropdownComponent extends ValueComponent<string> {
  public selectEl: HTMLSelectElement;

  private changeCallback?: () => void;

  public constructor(containerEl: HTMLElement) {
    super();
    this.selectEl = containerEl.createEl('select');
  }

  public static create__(containerEl: HTMLElement): DropdownComponent {
    return strictMock(new DropdownComponent(containerEl));
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

  public override asOriginalType__(): DropdownComponentOriginal {
    return castTo<DropdownComponentOriginal>(this);
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
