import type { DropdownComponent as RealDropdownComponent } from 'obsidian';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class DropdownComponent extends ValueComponent<string> {
  public selectEl: HTMLSelectElement;

  public override get inputEl(): HTMLSelectElement {
    return this.selectEl;
  }

  private changeCallback?: () => void;

  public constructor(_containerEl: HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Calling mock-only @deprecated ValueComponent constructor.
    super();
    this.selectEl = createEl('select');
    const mock = strictMock(this);
    DropdownComponent.constructor__(mock, _containerEl);
    return mock;
  }

  public static override constructor__<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
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
  public simulateChange(): void {
    this.changeCallback?.();
  }

  public override asReal__(): RealDropdownComponent {
    return strictCastTo<RealDropdownComponent>(this);
  }
}
