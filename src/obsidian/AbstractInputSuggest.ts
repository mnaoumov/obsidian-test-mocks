import type { AbstractInputSuggest as AbstractInputSuggestOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

const DEFAULT_LIMIT = 100;

export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  public limit = DEFAULT_LIMIT;
  public onSelectCallback__?: (value: T, event: KeyboardEvent | MouseEvent) => unknown;
  public readonly textInputEl: HTMLDivElement | HTMLInputElement;
  public constructor(app: App, textInputEl: HTMLDivElement | HTMLInputElement) {
    super(app);
    this.textInputEl = textInputEl;
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
    if (this.textInputEl instanceof HTMLInputElement) {
      return this.textInputEl.value;
    }
    return this.textInputEl.textContent;
  }

  public onSelect(callback: (value: T, event: KeyboardEvent | MouseEvent) => unknown): this {
    this.onSelectCallback__ = callback;
    return this;
  }

  public setValue(value: string): void {
    if (this.textInputEl instanceof HTMLInputElement) {
      this.textInputEl.value = value;
    } else {
      this.textInputEl.textContent = value;
    }
  }
}
