import type {
  ToggleComponent as ToggleComponentOriginal,
  TooltipOptions as TooltipOptionsOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ToggleComponent extends ValueComponent<boolean> {
  private static insideCreate__ = false;
  public toggleEl: HTMLElement;

  private _onChange: ((value: boolean) => unknown) | null = null;
  private _value = false;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.toggleEl = createDiv();
    if (new.target === ToggleComponent && !ToggleComponent.insideCreate__) {
      return ToggleComponent.create__(_containerEl);
    }
  }

  public static create__(containerEl: HTMLElement): ToggleComponent {
    ToggleComponent.insideCreate__ = true;
    const instance = strictMock(new ToggleComponent(containerEl));
    ToggleComponent.insideCreate__ = false;
    return instance;
  }

  public override asOriginalType__(): ToggleComponentOriginal {
    return castTo<ToggleComponentOriginal>(this);
  }

  public override getValue(): boolean {
    return this._value;
  }

  public onChange(callback: (value: boolean) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public onClick(): void {
    this._value = !this._value;
    this._onChange?.(this._value);
  }

  public setTooltip(tooltip: string, _options?: TooltipOptionsOriginal): this {
    this.toggleEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public override setValue(value: boolean): this {
    this._value = value;
    this._onChange?.(value);
    return this;
  }
}
