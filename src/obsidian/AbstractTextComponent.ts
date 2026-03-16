import type { AbstractTextComponent as AbstractTextComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

export abstract class AbstractTextComponent<T extends HTMLInputElement | HTMLTextAreaElement> extends ValueComponent<string> {
  public inputEl: T;

  private _onChange?: (value: string) => unknown;
  private value = '';

  public constructor(inputEl: T) {
    super();
    this.inputEl = inputEl;
    const self = strictProxy(this);
    self.constructor3__(inputEl);
    return self;
  }

  public static fromOriginalType3__<T extends HTMLInputElement | HTMLTextAreaElement>(value: AbstractTextComponentOriginal<T>): AbstractTextComponent<T> {
    return strictProxy<AbstractTextComponent<T>>(value);
  }

  public asOriginalType3__(): AbstractTextComponentOriginal<T> {
    return strictProxy<AbstractTextComponentOriginal<T>>(this);
  }

  public constructor3__(_inputEl: T): void {
    noop();
  }

  public override getValue(): string {
    return this.value;
  }

  public onChange(callback: (value: string) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public onChanged(): void {
    this._onChange?.(this.value);
  }

  public setPlaceholder(placeholder: string): this {
    this.inputEl.placeholder = placeholder;
    return this;
  }

  public override setValue(value: string): this {
    this.value = value;
    this.inputEl.value = value;
    this._onChange?.(value);
    return this;
  }
}
