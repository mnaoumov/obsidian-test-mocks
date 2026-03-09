import type { AbstractTextComponent as AbstractTextComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ValueComponent } from './ValueComponent.ts';

export abstract class AbstractTextComponent<T extends HTMLInputElement | HTMLTextAreaElement> extends ValueComponent<string> {
  public override inputEl: T;

  private _onChange?: (value: string) => unknown;
  private _value = '';

  public constructor(inputEl: T) {
    super();
    this.inputEl = inputEl;
    return strictMock(this);
  }

  public override asOriginalType__(): AbstractTextComponentOriginal<T> {
    return castTo<AbstractTextComponentOriginal<T>>(this);
  }

  public override getValue(): string {
    return this._value;
  }

  public onChange(callback: (value: string) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public onChanged(): void {
    this._onChange?.(this._value);
  }

  public setPlaceholder(placeholder: string): this {
    this.inputEl.placeholder = placeholder;
    return this;
  }

  public override setValue(value: string): this {
    this._value = value;
    this.inputEl.value = value;
    this._onChange?.(value);
    return this;
  }
}
