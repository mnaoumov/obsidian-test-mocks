import type { AbstractInputSuggest as AbstractInputSuggestOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  private readonly inputEl: HTMLDivElement | HTMLInputElement;
  public constructor(app: App, textInputEl: HTMLDivElement | HTMLInputElement) {
    super(app);
    this.inputEl = textInputEl;
    const self = strictProxy(this);
    self.constructor2__(app, textInputEl);
    return self;
  }

  public static fromOriginalType2__<T>(value: AbstractInputSuggestOriginal<T>): AbstractInputSuggest<T> {
    return strictProxy<AbstractInputSuggest<T>>(value);
  }

  public asOriginalType2__(): AbstractInputSuggestOriginal<T> {
    return strictProxy<AbstractInputSuggestOriginal<T>>(this);
  }

  public constructor2__(_app: App, _textInputEl: HTMLDivElement | HTMLInputElement): void {
    noop();
  }

  public getValue(): string {
    if (this.inputEl instanceof HTMLInputElement) {
      return this.inputEl.value;
    }
    return this.inputEl.textContent;
  }

  public setValue(value: string): void {
    if (this.inputEl instanceof HTMLInputElement) {
      this.inputEl.value = value;
    } else {
      this.inputEl.textContent = value;
    }
  }
}
