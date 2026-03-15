import type { AbstractInputSuggest as AbstractInputSuggestOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  private readonly inputEl: HTMLDivElement | HTMLInputElement;
  public constructor(app: App, textInputEl: HTMLDivElement | HTMLInputElement) {
    super(app);
    this.inputEl = textInputEl;
    const self = strictMock(this);
    self.constructor2__(app, textInputEl);
    return self;
  }

  public static override fromOriginalType__<T>(value: AbstractInputSuggestOriginal<T>): AbstractInputSuggest<T> {
    return castTo<AbstractInputSuggest<T>>(value);
  }

  public override asOriginalType__(): AbstractInputSuggestOriginal<T> {
    return castTo<AbstractInputSuggestOriginal<T>>(this);
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
